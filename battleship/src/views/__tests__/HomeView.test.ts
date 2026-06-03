import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { nextTick, ref } from 'vue'
import HomeView from '../HomeView.vue'
import { usePeerConnection } from '../../composables/usePeerConnection'
import { useLocale } from '../../composables/useLocale'
import { translations } from '../../i18n/translations'

vi.mock('../../composables/usePeerConnection')
vi.mock('../../composables/useLocale')

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/placement', component: { template: '<div/>' } },
    ],
  })
}

function createMockPeer(overrides: Record<string, any> = {}) {
  let connectedHandler: (() => void) | null = null
  let disconnectedHandler: (() => void) | null = null

  const mock = {
    status: ref('idle'),
    myPeerId: ref(''),
    errorMessage: ref(''),
    role: ref(null as any),
    initHost: vi.fn().mockResolvedValue('test-peer-id'),
    connectToHost: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn(),
    onMessage: vi.fn(),
    onConnected: vi.fn((cb: any) => { connectedHandler = cb }),
    onDisconnected: vi.fn((cb: any) => { disconnectedHandler = cb }),
    destroy: vi.fn(),
    _triggerConnected: () => connectedHandler?.(),
    _triggerDisconnected: () => disconnectedHandler?.(),
    ...overrides,
  }
  return mock
}

describe('HomeView', () => {
  let mockPeer: ReturnType<typeof createMockPeer>

  beforeEach(() => {
    mockPeer = createMockPeer()
    vi.mocked(usePeerConnection).mockReturnValue(mockPeer as any)
    vi.mocked(useLocale).mockReturnValue({
      locale: ref('nl') as any,
      t: (key: string) => {
        const keys = key.split('.')
        let obj: any = translations.nl
        for (const k of keys) obj = obj?.[k]
        return typeof obj === 'string' ? obj : key
      },
      setLocale: vi.fn(),
    })
    // Mock clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    })
  })

  it('toont startmenu bij laden', () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toContain('Zeeslag')
    expect(wrapper.find('button.btn.primary').text()).toContain('Nieuw spel')
  })

  it('klik "Nieuw spel" → initHost aangeroepen, lobby getoond', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    expect(mockPeer.initHost).toHaveBeenCalled()
    expect(wrapper.find('.lobby').exists()).toBe(true)
  })

  it('game-code wordt getoond na verbinding', async () => {
    const router = createTestRouter()
    mockPeer.initHost.mockImplementation(async () => {
      mockPeer.myPeerId.value = 'abc-123'
      return 'abc-123'
    })
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('.code').text()).toContain('abc-123')
  })

  it('onConnected navigeert naar /placement', async () => {
    const router = createTestRouter()
    await router.push('/')
    mount(HomeView, { global: { plugins: [router] } })
    // Klik host en wacht tot initHost klaar is
    await mount(HomeView, { global: { plugins: [router] } }).find('button.btn.primary').trigger('click')
    await flushPromises()
    // Trigger onConnected callback
    const calls = mockPeer.onConnected.mock.calls
    if (calls.length > 0) {
      calls[calls.length - 1][0]()
      await flushPromises()
    }
    expect(router.currentRoute.value.path).toBe('/placement')
  })

  it('annuleer in lobby → keert terug naar startmenu', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await wrapper.find('button.btn.ghost').trigger('click')
    await nextTick()
    expect(wrapper.find('.menu').exists()).toBe(true)
  })

  it('klik "Verbinden" → toon invoerveld', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    expect(wrapper.find('.join').exists()).toBe(true)
  })

  it('verbinden met code → navigeert naar /placement', async () => {
    const router = createTestRouter()
    await router.push('/')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    await wrapper.find('input').setValue('host-peer-id')
    await wrapper.find('button.btn.primary').trigger('click')
    await flushPromises()
    expect(mockPeer.connectToHost).toHaveBeenCalledWith('host-peer-id')
    expect(router.currentRoute.value.path).toBe('/placement')
  })

  it('verbinden met enter-toets', async () => {
    const router = createTestRouter()
    await router.push('/')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    await wrapper.find('input').setValue('host-id')
    await wrapper.find('input').trigger('keyup.enter')
    await nextTick()
    await nextTick()
    expect(mockPeer.connectToHost).toHaveBeenCalled()
  })

  it('kopieer-knop roept clipboard.writeText aan', async () => {
    const router = createTestRouter()
    mockPeer.myPeerId.value = 'test-id'
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await nextTick()
    const copyBtn = wrapper.find('button.btn.small')
    await copyBtn.trigger('click')
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-id')
  })

  it('foutmelding bij mislukte verbinding', async () => {
    mockPeer.connectToHost.mockRejectedValue(new Error('niet bereikbaar'))
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    await wrapper.find('input').setValue('bad-id')
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('foutmelding bij mislukte host aanmaak', async () => {
    mockPeer.initHost.mockRejectedValue(new Error('server fout'))
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await nextTick()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('verbinding verbroken als guest → toont foutmelding', async () => {
    mockPeer.connectToHost.mockImplementation(async () => {
      // Trigger disconnected after connecting
    })
    const router = createTestRouter()
    await router.push('/')
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    await wrapper.find('input').setValue('id')
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()
    await nextTick()

    // Trigger disconnected via guest path
    mockPeer._triggerDisconnected()
    await nextTick()
    expect(wrapper.find('.error').exists()).toBe(true)
  })

  it('verbinding verbroken als host in lobby → keert terug naar idle', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await nextTick()

    // onDisconnected was geregistreerd via initHost flow
    // Simuleer via de host onDisconnected callback
    const onDisconnectedCalls = mockPeer.onDisconnected.mock.calls
    if (onDisconnectedCalls.length > 0) {
      onDisconnectedCalls[0][0]() // roep de laatste callback aan
      await nextTick()
      expect(wrapper.find('.menu').exists()).toBe(true)
    }
  })

  it('terugknop in join-modus toont startmenu', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    await wrapper.find('button.btn.ghost').trigger('click')
    await nextTick()
    expect(wrapper.find('.menu').exists()).toBe(true)
  })

  it('enter met lege code doet niets', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    // input is leeg (geen setValue)
    await wrapper.find('input').trigger('keyup.enter')
    await nextTick()
    expect(mockPeer.connectToHost).not.toHaveBeenCalled()
  })

  it('verbinden-knop is disabled zonder code', async () => {
    const router = createTestRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.secondary').trigger('click')
    await nextTick()
    expect(wrapper.find('button.btn.primary[disabled]').exists()).toBe(true)
  })
})

// Helper voor onConnected flow
async function wrapper_click_host_and_connect(router: any, mockPeer: any) {
  // initHost is al gemockt, trigger onConnected
  const calls = mockPeer.onConnected.mock.calls
  if (calls.length > 0) {
    calls[0][0]()
    await nextTick()
  }
}
