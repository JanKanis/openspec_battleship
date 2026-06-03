import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'
import ConnectionWarning from '../../components/ConnectionWarning.vue'
import { usePeerConnection } from '../../composables/usePeerConnection'
import { useLocale } from '../../composables/useLocale'
import { translations } from '../../i18n/translations'

vi.mock('../../composables/usePeerConnection')
vi.mock('../../composables/useLocale')

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
    ],
  })
}

describe('ConnectionWarning', () => {
  let mockPeer: any

  beforeEach(() => {
    mockPeer = {
      status: ref('connected'),
      myPeerId: ref(''),
      errorMessage: ref(''),
      role: ref(null),
      heartbeatLost: ref(false),
      secondsSinceLastHeartbeat: ref(0),
      initHost: vi.fn(),
      connectToHost: vi.fn(),
      sendMessage: vi.fn(),
      onMessage: vi.fn(),
      onConnected: vi.fn(),
      onDisconnected: vi.fn(),
      destroy: vi.fn(),
    }
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
  })

  it('toont de waarschuwingstekst', () => {
    const router = createTestRouter()
    const wrapper = mount(ConnectionWarning, {
      props: { secondsSinceLastHeartbeat: 20 },
      global: { plugins: [router] },
    })

    expect(wrapper.find('.warning-text').text()).toContain('Geen verbinding')
    expect(wrapper.find('.seconds').text()).toContain('20')
  })

  it('de "Spel afbreken" knop roept destroy aan en navigeert naar /', async () => {
    const router = createTestRouter()
    await router.push('/')
    const wrapper = mount(ConnectionWarning, {
      props: { secondsSinceLastHeartbeat: 20 },
      global: { plugins: [router] },
    })

    await wrapper.find('.btn.abort').trigger('click')
    await flushPromises()

    expect(mockPeer.destroy).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/')
  })
})
