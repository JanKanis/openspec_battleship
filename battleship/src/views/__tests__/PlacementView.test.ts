import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick, ref } from 'vue'
import PlacementView from '../PlacementView.vue'
import { gameState, resetGame } from '../../game/state'
import { usePeerConnection } from '../../composables/usePeerConnection'

vi.mock('../../composables/usePeerConnection')

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/placement', component: PlacementView },
      { path: '/game', component: { template: '<div/>' } },
    ],
  })
}

function createMockPeer() {
  let messageHandler: ((msg: any) => void) | null = null
  let disconnectedHandler: (() => void) | null = null

  const mock = {
    status: ref('connected'),
    myPeerId: ref('test-id'),
    errorMessage: ref(''),
    role: ref(null as any),
    heartbeatLost: ref(false),
    secondsSinceLastHeartbeat: ref(0),
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

// Hulpfunctie: plaatst alle 5 schepen op het bord via UI-klikken
// Schepen worden horizontaal geplaatst op rijen 0-4 (startcel kolom 0)
async function placeAllShips(wrapper: any) {
  const shipItems = wrapper.findAll('.ship-item')
  // Schepen: carrier(5), battleship(4), cruiser(3), submarine(3), destroyer(2)
  // Plaatsen op rijen 0-4 zodat ze niet overlappen
  for (let i = 0; i < 5; i++) {
    await shipItems[i].trigger('click')
    await nextTick()
    const cells = wrapper.findAll('.cell')
    await cells[i * 10].trigger('click') // kolom 0, rij i
    await nextTick()
  }
}

describe('PlacementView', () => {
  let mockPeer: ReturnType<typeof createMockPeer>

  beforeEach(() => {
    resetGame()
    gameState.role = 'host'
    mockPeer = createMockPeer()
    vi.mocked(usePeerConnection).mockReturnValue(mockPeer as any)
  })

  it('cel klik zonder geselecteerd schip doet niets', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    // Geen schip geselecteerd, maar bord is niet-interactief dus dit test de guard
    // We forceren door direct de GameBoard cell-click te emitteren via het bord
    // (selectedShip is null → handleCellClick returnt direct)
    const board = wrapper.findComponent({ name: 'GameBoard' })
    await board.vm.$emit('cellClick', 0, 0)
    await nextTick()
    // Geen schip geplaatst
    expect(wrapper.findAll('.ship-item')[0].classes()).not.toContain('placed')
  })

  it('toont de plaatsingsinterface', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    expect(wrapper.find('h2').text()).toContain('Schepen plaatsen')
    expect(wrapper.findAll('.ship-item')).toHaveLength(5)
  })

  it('klaar-knop is niet zichtbaar zolang niet alle schepen geplaatst zijn', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    expect(wrapper.find('button.btn.primary').exists()).toBe(false)
  })

  it('klaar-knop verschijnt nadat alle schepen geplaatst zijn', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await placeAllShips(wrapper)
    expect(wrapper.find('button.btn.primary').exists()).toBe(true)
    expect(wrapper.find('button.btn.primary').text()).toContain('Klaar')
  })

  it('selecteert schip bij klik op ship-item', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await wrapper.findAll('.ship-item')[0].trigger('click')
    await nextTick()
    expect(wrapper.findAll('.ship-item')[0].classes()).toContain('selected')
  })

  it('stuurt ready bericht bij klik op Klaar', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await placeAllShips(wrapper)
    await wrapper.find('button.btn.primary').trigger('click')
    expect(mockPeer.sendMessage).toHaveBeenCalledWith({ type: 'ready' })
  })

  it('navigeert naar /game: eigen klaar eerst, daarna ready ontvangen', async () => {
    const router = createTestRouter()
    await router.push('/placement')
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await placeAllShips(wrapper)

    await wrapper.find('button.btn.primary').trigger('click')
    await flushPromises()

    // Nog niet genavigeerd
    expect(router.currentRoute.value.path).toBe('/placement')

    // Tegenstander stuurt ready
    mockPeer._triggerMessage({ type: 'ready' })
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/game')
  })

  it('navigeert naar /game: tegenstander ready eerst, daarna eigen klaar', async () => {
    const router = createTestRouter()
    await router.push('/placement')
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await placeAllShips(wrapper)

    // Tegenstander stuurt ready vóór dat we op Klaar klikken
    mockPeer._triggerMessage({ type: 'ready' })
    await flushPromises()

    // Nog niet genavigeerd
    expect(router.currentRoute.value.path).toBe('/placement')

    // Nu klik Klaar
    await wrapper.find('button.btn.primary').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/game')
  })

  it('navigeert naar / bij verbindingsverlies', async () => {
    const router = createTestRouter()
    await router.push('/placement')
    mount(PlacementView, { global: { plugins: [router] } })

    mockPeer._triggerDisconnected()
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('oriëntatie wisselt bij klik op roteren-knop', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    const btn = wrapper.find('button.btn.secondary')
    expect(btn.text()).toContain('↔')
    await btn.trigger('click')
    expect(btn.text()).toContain('↕')
  })

  it('oriëntatie wisselt bij R-toets', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }))
    await nextTick()
    expect(wrapper.find('button.btn.secondary').text()).toContain('↕')
  })

  it('oriëntatie wisselt bij hoofdletter R', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'R' }))
    await nextTick()
    expect(wrapper.find('button.btn.secondary').text()).toContain('↕')
  })

  it('hover en board-leave werken', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    // Selecteer schip zodat we preview zien
    await wrapper.findAll('.ship-item')[0].trigger('click')
    await nextTick()
    // Trigger hover op een cel
    await wrapper.findAll('.cell')[0].trigger('mousemove')
    await nextTick()
    // Trigger board leave
    await wrapper.find('.grid-with-row-labels').trigger('mouseleave')
    await nextTick()
    // Geen crash verwacht
    expect(wrapper.exists()).toBe(true)
  })

  it('negeert klik op geplaatst schip', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    // Selecteer en plaats schip 0
    await wrapper.findAll('.ship-item')[0].trigger('click')
    await nextTick()
    await wrapper.findAll('.cell')[0].trigger('click')
    await nextTick()
    // Probeer geplaatst schip opnieuw te selecteren
    await wrapper.findAll('.ship-item')[0].trigger('click')
    await nextTick()
    // Geplaatste items kunnen niet geselecteerd worden
    expect(wrapper.findAll('.ship-item')[0].classes()).not.toContain('selected')
  })

  it('negeert ongeldige plaatsing (cel buiten grens of bezet)', async () => {
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    // Selecteer carrier (size 5), probeer te plaatsen op kolom 8 (valt buiten bord met size 5)
    await wrapper.findAll('.ship-item')[0].trigger('click')
    await nextTick()
    // Cel 8 in rij 0 = index 8, geldig maar carrier steekt buiten rechterrand
    await wrapper.findAll('.cell')[8].trigger('click')
    await nextTick()
    // Carrier is niet geplaatst
    expect(wrapper.findAll('.ship-item')[0].classes()).not.toContain('placed')
  })

  // --- heartbeat waarschuwing ---
  it('toont ConnectionWarning als heartbeatLost true is', async () => {
    resetGame()
    mockPeer.heartbeatLost.value = true
    mockPeer.secondsSinceLastHeartbeat.value = 18
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await nextTick()

    expect(wrapper.find('.connection-warning').exists()).toBe(true)
    expect(wrapper.find('.seconds').text()).toContain('18')
  })

  it('verbergt ConnectionWarning als heartbeatLost false is', async () => {
    resetGame()
    mockPeer.heartbeatLost.value = false
    const router = createTestRouter()
    const wrapper = mount(PlacementView, { global: { plugins: [router] } })
    await nextTick()

    expect(wrapper.find('.connection-warning').exists()).toBe(false)
  })
})
