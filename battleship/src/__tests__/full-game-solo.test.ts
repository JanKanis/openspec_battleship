/**
 * End-to-end integratietest: volledig solo spel tegen AI
 *
 * Simuleert een compleet potje Battleship tegen een deterministische nep-AI.
 * De AI reageert synchroon (geen echte setTimeout) zodat de test deterministisch is.
 * De winnaar is niet voorspeld — de test valideert alleen dat het spel tot game-over loopt.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick, ref } from 'vue'

import { gameState, resetGame } from '../game/state'
import { useGameConnection } from '../composables/useGameConnection'
import { useLocale } from '../composables/useLocale'
import { translations } from '../i18n/translations'
import { SHIP_DEFINITIONS, type Ship, type ShipType } from '../game/types'
import { createBoard, placeShip, fireShot, checkWin } from '../game/logic'

import PlacementView from '../views/PlacementView.vue'
import GameView from '../views/GameView.vue'
import GameOverView from '../views/GameOverView.vue'

vi.mock('../composables/useGameConnection')
vi.mock('../composables/useLocale')

function buildFleet(prefix: string): { board: ReturnType<typeof createBoard>; ships: Ship[] } {
  let board = createBoard()
  const ships: Ship[] = SHIP_DEFINITIONS.map((def, i) => ({
    id: `${prefix}-${i}`,
    type: def.type as ShipType,
    size: def.size,
    orientation: 'horizontal' as const,
    x: 0,
    y: i,
    hits: 0,
  }))
  for (const s of ships) board = placeShip(board, s)
  return { board, ships }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/placement', component: PlacementView },
      { path: '/game', component: GameView },
      { path: '/gameover', component: GameOverView },
    ],
  })
}

describe('Full game solo E2E', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetGame()
    vi.mocked(useLocale).mockReturnValue({
      locale: ref('nl') as any,
      t: (key: string, vars?: Record<string, string>) => {
        const keys = key.split('.')
        let obj: any = translations.nl
        for (const k of keys) obj = obj?.[k]
        let result = typeof obj === 'string' ? obj : key
        if (vars) {
          for (const [k, v] of Object.entries(vars)) result = result.replace(`{${k}}`, v)
        }
        return result
      },
      setLocale: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('speelt een volledig solo spel: plaatsing → game-over', async () => {
    // AI-bord: schepen op rijen 0-4 (deterministische layout)
    let { board: aiBoard, ships: aiShips } = buildFleet('ai')
    // Speler-bord: schepen op rijen 5-9 (zodat ze niet overlappen met AI-shots)
    let { board: playerBoard, ships: playerShips } = buildFleet('player')

    // AI-schietstrategie: schiet systematisch rij voor rij
    let aiShotIndex = 0
    const aiShots = Array.from({ length: 100 }, (_, i) => ({ x: i % 10, y: Math.floor(i / 10) }))

    let messageHandler: ((msg: any) => void) | null = null

    // Nep-AI connection die deterministisch reageert (zonder echte timer delays)
    const mockConn = {
      heartbeatLost: ref(false),
      secondsSinceLastHeartbeat: ref(0),
      isAI: true,
      sendMessage: vi.fn((msg: any) => {
        if (msg.type === 'ready') {
          // AI stuurt direct ready terug
          Promise.resolve().then(() => {
            messageHandler?.({ type: 'ready' })
            // Speler begint (myTurn=true), AI wacht
          })
        }

        if (msg.type === 'shot') {
          // Speler schiet op AI-bord
          const result = fireShot(aiBoard, aiShips, msg.x, msg.y)
          aiBoard = result.newBoard
          aiShips = result.newShips

          Promise.resolve().then(() => {
            if (checkWin(aiShips)) {
              messageHandler?.({ type: 'game-over', winner: 'host' })
            } else {
              messageHandler?.({ type: 'shot-result', x: msg.x, y: msg.y, hit: result.hit, ...(result.sunk ? { sunk: result.sunk } : {}) })
              if (!result.hit) {
                // AI is aan de beurt — schiet op spelersbord
                const aiShot = aiShots[aiShotIndex++]
                Promise.resolve().then(() => {
                  messageHandler?.({ type: 'shot', x: aiShot.x, y: aiShot.y })
                })
              }
            }
          })
        }

        if (msg.type === 'shot-result') {
          // Resultaat van AI's schot
          if (checkWin(playerShips)) {
            Promise.resolve().then(() =>
              messageHandler?.({ type: 'game-over', winner: 'guest' }),
            )
          } else if (msg.hit) {
            // AI heeft geraakt, schiet opnieuw
            const aiShot = aiShots[aiShotIndex++]
            Promise.resolve().then(() => {
              messageHandler?.({ type: 'shot', x: aiShot.x, y: aiShot.y })
            })
          }
        }
      }),
      onMessage: vi.fn((cb: any) => { messageHandler = cb }),
      onDisconnected: vi.fn(),
      destroy: vi.fn(),
    }

    vi.mocked(useGameConnection).mockReturnValue(mockConn as any)

    // Stel gameState in: speler begint
    gameState.role = 'host'
    gameState.phase = 'placement'
    gameState.myTurn = true
    // Spelersbord instellen zodat AI-shots valide zijn
    gameState.myBoard = playerBoard
    gameState.myShips = playerShips

    const router = createTestRouter()
    await router.push('/placement')

    // -----------------------------------------------------------------------
    // FASE 1: Plaatsing
    // -----------------------------------------------------------------------

    const placementWrapper = mount(PlacementView, { global: { plugins: [router] } })

    // Plaats alle 5 schepen: rijen 0-4 (kolom 0 per schip)
    const shipItems = placementWrapper.findAll('.ship-item')
    for (let i = 0; i < 5; i++) {
      await shipItems[i].trigger('click')
      await nextTick()
      await placementWrapper.findAll('.cell')[i * 10].trigger('click')
      await nextTick()
    }

    // Klik "Klaar!" → AI stuurt ready terug → navigeert naar /game
    await placementWrapper.find('button.btn.primary').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/game')

    // -----------------------------------------------------------------------
    // FASE 2: Spelfase — speel tot game-over
    // -----------------------------------------------------------------------

    const gameWrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    const oppCell = (x: number, y: number) =>
      gameWrapper.findAll('.board-section')[1].findAll('.cell')[y * 10 + x]

    // Speler schiet systematisch alle AI-scheepscellen raak (rijen 0-4)
    const playerShots = [
      // Carrier rij 0
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
      // Battleship rij 1
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      // Cruiser rij 2
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      // Submarine rij 3
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
      // Destroyer rij 4
      { x: 0, y: 4 }, { x: 1, y: 4 },
    ]

    // Schiet totdat game-over bereikt is of alle schoten gedaan zijn
    for (const { x, y } of playerShots) {
      if (router.currentRoute.value.path === '/gameover') break
      if (gameState.myTurn) {
        await oppCell(x, y).trigger('click')
        await flushPromises()
      }
    }

    // -----------------------------------------------------------------------
    // FASE 3: Game-over
    // -----------------------------------------------------------------------

    expect(router.currentRoute.value.path).toBe('/gameover')
    expect(gameState.phase).toBe('gameover')
    expect(['host', 'guest']).toContain(gameState.winner)
  })
})
