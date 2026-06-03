/**
 * End-to-end integratietest: volledig spel
 *
 * Simuleert een compleet potje Battleship van schepen plaatsen tot game-over.
 * De host is de "echte" Vue-component; de tegenstander is een auto-responding
 * mock peer. Beide kanten vuren minstens één raak én één mis schot.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick, ref } from 'vue'

import { gameState, resetGame } from '../game/state'
import { useGameConnection } from '../composables/useGameConnection'
import { useLocale } from '../composables/useLocale'
import { translations } from '../i18n/translations'
import { SHIP_DEFINITIONS, type Ship, type ShipType } from '../game/types'
import { createBoard, placeShip, fireShot } from '../game/logic'

import PlacementView from '../views/PlacementView.vue'
import GameView from '../views/GameView.vue'
import GameOverView from '../views/GameOverView.vue'

vi.mock('../composables/useGameConnection')
vi.mock('../composables/useLocale')

// ---------------------------------------------------------------------------
// Hulpfuncties
// ---------------------------------------------------------------------------

/**
 * Bouwt een tegenstander-vloot op: elk schip horizontaal op zijn eigen rij,
 * startend bij x=0. Zelfde layout als wat PlacementView voor de host plaatst.
 *
 *   Rij 0: Carrier     (5) — cellen (0,0)…(4,0)
 *   Rij 1: Battleship  (4) — cellen (0,1)…(3,1)
 *   Rij 2: Cruiser     (3) — cellen (0,2)…(2,2)
 *   Rij 3: Submarine   (3) — cellen (0,3)…(2,3)
 *   Rij 4: Destroyer   (2) — cellen (0,4)…(1,4)
 */
function buildOpponentFleet() {
  let board = createBoard()
  const ships: Ship[] = SHIP_DEFINITIONS.map((def, i) => ({
    id: `opp-${i}`,
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

// ---------------------------------------------------------------------------
// De test
// ---------------------------------------------------------------------------

describe('Full game E2E', () => {
  beforeEach(() => {
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

  it('speelt een volledig spel: plaatsing → schietfase met rake/gemiste schoten van beide kanten → game-over', async () => {
    // --- Tegenstander simulatie ---
    let { board: oppBoard, ships: oppShips } = buildOpponentFleet()

    // messageHandler wijst altijd naar de handler van de huidig gemounte view
    let messageHandler: ((msg: any) => void) | null = null

    const mockConn = {
      heartbeatLost: ref(false),
      secondsSinceLastHeartbeat: ref(0),
      isAI: false,
      sendMessage: vi.fn((msg: any) => {
        if (msg.type === 'ready') {
          // Tegenstander is ook klaar
          Promise.resolve().then(() => messageHandler?.({ type: 'ready' }))
        }

        if (msg.type === 'shot') {
          // Host schoot op tegenstander; bereken resultaat en stuur shot-result terug
          const result = fireShot(oppBoard, oppShips, msg.x, msg.y)
          oppBoard = result.newBoard
          oppShips = result.newShips
          const allSunk = oppShips.every((s) => s.hits >= s.size)

          Promise.resolve().then(() => {
            messageHandler?.({
              type: 'shot-result',
              x: msg.x,
              y: msg.y,
              hit: result.hit,
              sunk: result.sunk,
            })
            // Als alle tegenstander-schepen gezonken zijn: stuur game-over
            if (allSunk) {
              Promise.resolve().then(() =>
                messageHandler?.({ type: 'game-over', winner: 'host' }),
              )
            }
          })
        }
        // shot-result (terugsturen na ontvangen shot): geen auto-response nodig
      }),
      onMessage: vi.fn((cb: any) => {
        messageHandler = cb
      }),
      onDisconnected: vi.fn(),
      destroy: vi.fn(),
    }

    vi.mocked(useGameConnection).mockReturnValue(mockConn as any)

    // -----------------------------------------------------------------------
    // FASE 1: Plaatsing
    // -----------------------------------------------------------------------

    gameState.role = 'host'
    gameState.phase = 'placement'
    gameState.myTurn = true

    const router = createTestRouter()
    await router.push('/placement')

    const placementWrapper = mount(PlacementView, { global: { plugins: [router] } })

    // Plaats alle 5 schepen via de UI: selecteer schip → klik cel [i*10] (kolom 0, rij i)
    const shipItems = placementWrapper.findAll('.ship-item')
    for (let i = 0; i < 5; i++) {
      await shipItems[i].trigger('click')
      await nextTick()
      await placementWrapper.findAll('.cell')[i * 10].trigger('click')
      await nextTick()
    }

    // Klik "Klaar!" → stuurt ready → mock stuurt ready terug → navigeert naar /game
    await placementWrapper.find('button.btn.primary').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/game')

    // -----------------------------------------------------------------------
    // FASE 2: Schietfase
    //
    // Tegenstander-schoten worden gesimuleerd via messageHandler?.({ type: 'shot' }).
    // Host-schoten via UI-klikken op het tegenstander-bord.
    //
    // Cel-index in het bord: y * 10 + x  (rij-major, 0-gebaseerd)
    // -----------------------------------------------------------------------

    const gameWrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    // Hulp: cel (x, y) in het tegenstander-bord (tweede .board-section)
    const oppCell = (x: number, y: number) =>
      gameWrapper.findAll('.board-section')[1].findAll('.cell')[y * 10 + x]

    // --- Beurt 1 (host): MIS — schiet op lege cel (9,9) ---
    expect(gameState.myTurn).toBe(true)
    await oppCell(9, 9).trigger('click')
    await flushPromises()

    expect(gameState.opponentBoard[9][9].state).toBe('miss')
    expect(gameState.myTurn).toBe(false) // mis → beurt naar tegenstander

    // --- Beurt 2 (tegenstander): MIS — schiet op lege cel (9,9) van host ---
    messageHandler?.({ type: 'shot', x: 9, y: 9 })
    await flushPromises()

    expect(gameState.myBoard[9][9].state).toBe('miss')
    expect(gameState.myTurn).toBe(true) // tegenstander mistte → beurt terug naar host

    // --- Beurt 3 (host): RAAK — schiet op carrier van tegenstander (0,0) ---
    await oppCell(0, 0).trigger('click')
    await flushPromises()

    expect(gameState.opponentBoard[0][0].state).toBe('hit')
    expect(gameState.myTurn).toBe(true) // raak → host mag opnieuw

    // --- Beurt 4 (tegenstander): RAAK — schiet op carrier van host (0,0) ---
    messageHandler?.({ type: 'shot', x: 0, y: 0 })
    await flushPromises()

    expect(gameState.myBoard[0][0].state).toBe('hit')
    expect(gameState.myTurn).toBe(false) // tegenstander raak → tegenstander mag opnieuw

    // --- Beurt 5 (tegenstander): MIS — schiet op lege cel (9,8) van host ---
    messageHandler?.({ type: 'shot', x: 9, y: 8 })
    await flushPromises()

    expect(gameState.myBoard[8][9].state).toBe('miss')
    expect(gameState.myTurn).toBe(true) // tegenstander miste → beurt naar host

    // -----------------------------------------------------------------------
    // FASE 3: Host rondt af
    //
    // Carrier is al 1× geraakt op (0,0); schiet de rest raak.
    // Daarna alle overige schepen volledig raak → mock stuurt game-over.
    // Elke raak schot houdt myTurn op true, zodat de host door kan schieten.
    // -----------------------------------------------------------------------

    const finishingShots = [
      // Carrier (rij 0): resterende cellen na (0,0)
      { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 4, y: 0 },
      // Battleship (rij 1)
      { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      // Cruiser (rij 2)
      { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
      // Submarine (rij 3)
      { x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 },
      // Destroyer (rij 4) — laatste schot triggert game-over
      { x: 0, y: 4 }, { x: 1, y: 4 },
    ]

    for (const { x, y } of finishingShots) {
      await oppCell(x, y).trigger('click')
      await flushPromises()
    }

    // -----------------------------------------------------------------------
    // FASE 4: Game-over
    // -----------------------------------------------------------------------

    expect(router.currentRoute.value.path).toBe('/gameover')
    expect(gameState.winner).toBe('host')
    expect(gameState.phase).toBe('gameover')
  })
})
