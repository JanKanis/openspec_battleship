import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick, ref } from 'vue'
import GameView from '../GameView.vue'
import { gameState, resetGame } from '../../game/state'
import { createBoard, placeShip } from '../../game/logic'
import { usePeerConnection } from '../../composables/usePeerConnection'
import type { Ship } from '../../game/types'

vi.mock('../../composables/usePeerConnection')

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/game', component: GameView },
      { path: '/gameover', component: { template: '<div/>' } },
    ],
  })
}

function createMockPeer() {
  let messageHandler: ((msg: any) => void) | null = null
  let disconnectedHandler: (() => void) | null = null

  const mock = {
    status: ref('connected'),
    myPeerId: ref(''),
    errorMessage: ref(''),
    role: ref(null as any),
    initHost: vi.fn(),
    connectToHost: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: vi.fn((cb: any) => { messageHandler = cb }),
    onConnected: vi.fn(),
    onDisconnected: vi.fn((cb: any) => { disconnectedHandler = cb }),
    destroy: vi.fn(),
    _triggerMessage: (msg: any) => messageHandler?.(msg),
    _triggerDisconnected: () => disconnectedHandler?.(),
  }
  return mock
}

function setupGameState(role: 'host' | 'guest', myTurn: boolean) {
  resetGame()
  gameState.phase = 'playing'
  gameState.role = role
  gameState.myTurn = myTurn

  // Stel een schip in op myBoard
  const ship: Ship = { id: 'ship-0', type: 'destroyer', size: 2, orientation: 'horizontal', x: 0, y: 0, hits: 0 }
  gameState.myShips = [ship]
  gameState.myBoard = placeShip(createBoard(), ship)
  gameState.opponentBoard = createBoard()
}

describe('GameView', () => {
  let mockPeer: ReturnType<typeof createMockPeer>

  beforeEach(() => {
    mockPeer = createMockPeer()
    vi.mocked(usePeerConnection).mockReturnValue(mockPeer as any)
  })

  // --- Schietflow ---
  it('speler klikt cel → stuurt shot bericht en myTurn wordt false', async () => {
    setupGameState('host', true)
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    // Klik op eerste cel van tegenstander-bord (tweede GameBoard)
    const boards = wrapper.findAll('.board-section')
    const opponentCells = boards[1].findAll('.cell')
    await opponentCells[0].trigger('click')

    expect(mockPeer.sendMessage).toHaveBeenCalledWith({ type: 'shot', x: 0, y: 0 })
    expect(gameState.myTurn).toBe(false)
  })

  it('klik op cel terwijl myTurn false → geen bericht gestuurd', async () => {
    setupGameState('guest', false)
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    const boards = wrapper.findAll('.board-section')
    const opponentCells = boards[1].findAll('.cell')
    await opponentCells[0].trigger('click')

    expect(mockPeer.sendMessage).not.toHaveBeenCalled()
  })

  it('klik op cel die al hit is → geen bericht gestuurd', async () => {
    setupGameState('host', true)
    gameState.opponentBoard[0][0] = { x: 0, y: 0, state: 'hit' }
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    const boards = wrapper.findAll('.board-section')
    const opponentCells = boards[1].findAll('.cell')
    await opponentCells[0].trigger('click')

    expect(mockPeer.sendMessage).not.toHaveBeenCalled()
  })

  it('klik op cel die al miss is → geen bericht gestuurd', async () => {
    setupGameState('host', true)
    gameState.opponentBoard[0][0] = { x: 0, y: 0, state: 'miss' }
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })
    await nextTick()

    const boards = wrapper.findAll('.board-section')
    const opponentCells = boards[1].findAll('.cell')
    await opponentCells[0].trigger('click')

    expect(mockPeer.sendMessage).not.toHaveBeenCalled()
  })

  // --- Inkomend shot verwerken ---
  it('ontvangt shot → verwerkt op myBoard en stuurt shot-result terug (mis)', async () => {
    setupGameState('guest', false)
    const router = createTestRouter()
    mount(GameView, { global: { plugins: [router] } })

    // Schiet op een lege cel (geen schip op (5,5))
    mockPeer._triggerMessage({ type: 'shot', x: 5, y: 5 })
    await nextTick()

    expect(mockPeer.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shot-result', x: 5, y: 5, hit: false }),
    )
    expect(gameState.myBoard[5][5].state).toBe('miss')
  })

  it('ontvangt shot → verwerkt op myBoard en stuurt shot-result terug (raak)', async () => {
    setupGameState('host', false)
    const router = createTestRouter()
    mount(GameView, { global: { plugins: [router] } })

    // Schiet op de scheepscel (0,0)
    mockPeer._triggerMessage({ type: 'shot', x: 0, y: 0 })
    await nextTick()

    expect(mockPeer.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shot-result', x: 0, y: 0, hit: true }),
    )
  })

  it('ontvangt shot op laatste scheepscel → stuurt game-over en navigeert', async () => {
    setupGameState('host', false)
    // Destroyer: size 2, één hit al verwerkt
    gameState.myShips[0].hits = 1
    const router = createTestRouter()
    await router.push('/game')
    mount(GameView, { global: { plugins: [router] } })

    // Schiet op de tweede cel van het schip (x=1, y=0)
    mockPeer._triggerMessage({ type: 'shot', x: 1, y: 0 })
    await flushPromises()

    expect(mockPeer.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'game-over', winner: 'guest' }),
    )
    expect(router.currentRoute.value.path).toBe('/gameover')
  })

  // --- shot-result verwerken ---
  it('ontvangt shot-result mis → opponentBoard bijgewerkt, myTurn true', async () => {
    setupGameState('host', true)
    const router = createTestRouter()
    mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot-result', x: 3, y: 3, hit: false })
    await nextTick()

    expect(gameState.opponentBoard[3][3].state).toBe('miss')
    expect(gameState.myTurn).toBe(false) // hit=false → myTurn = msg.hit = false → wisselt naar tegenstander
  })

  it('ontvangt shot-result raak → myTurn true (zelfde speler mag opnieuw)', async () => {
    setupGameState('host', true)
    const router = createTestRouter()
    mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot-result', x: 2, y: 2, hit: true })
    await nextTick()

    expect(gameState.opponentBoard[2][2].state).toBe('hit')
    expect(gameState.myTurn).toBe(true)
  })

  it('ontvangt shot-result met sunk → toont notificatie', async () => {
    setupGameState('host', true)
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot-result', x: 0, y: 0, hit: true, sunk: 'destroyer' })
    await nextTick()

    expect(wrapper.find('.notification').text()).toContain('gezonken')
  })

  // --- game-over ontvangen ---
  it('ontvangt game-over → navigeert naar /gameover', async () => {
    setupGameState('host', false)
    const router = createTestRouter()
    await router.push('/game')
    mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'game-over', winner: 'host' })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/gameover')
    expect(gameState.winner).toBe('host')
  })

  // --- verbindingsverlies ---
  it('verbinding verbroken → toont melding en navigeert naar /', async () => {
    setupGameState('host', true)
    const router = createTestRouter()
    await router.push('/game')
    const wrapper = mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerDisconnected()
    await nextTick()

    expect(wrapper.find('.notification').text()).toContain('Verbinding verbroken')

    await new Promise((r) => setTimeout(r, 2100))
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('ontvangt shot op laatste scheepscel als guest → winner is host', async () => {
    setupGameState('guest', false)
    gameState.myShips[0].hits = 1
    const router = createTestRouter()
    await router.push('/game')
    mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot', x: 1, y: 0 })
    await flushPromises()

    expect(mockPeer.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'game-over', winner: 'host' }),
    )
    expect(router.currentRoute.value.path).toBe('/gameover')
  })

  // --- guest ontvangt shot van host (de bug die eerder vastliep) ---
  it('guest verwerkt inkomend shot van host (symmetrisch protocol)', async () => {
    setupGameState('guest', false)
    const router = createTestRouter()
    mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot', x: 0, y: 0 })
    await nextTick()

    // Guest stuurt shot-result terug — dit was de bug
    expect(mockPeer.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'shot-result' }),
    )
  })

  // --- inkomend shot gezonken (notificatie) ---
  it('ontvangt shot op gezonken schip → toont notificatie', async () => {
    setupGameState('host', false)
    gameState.myShips[0].hits = 1
    const router = createTestRouter()
    const wrapper = mount(GameView, { global: { plugins: [router] } })

    mockPeer._triggerMessage({ type: 'shot', x: 1, y: 0 })
    await nextTick()

    expect(wrapper.find('.notification').text()).toContain('gezonken')
  })
})
