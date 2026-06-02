import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { ref } from 'vue'
import GameOverView from '../GameOverView.vue'
import { gameState, resetGame } from '../../game/state'
import { usePeerConnection } from '../../composables/usePeerConnection'

vi.mock('../../composables/usePeerConnection')

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div/>' } },
      { path: '/gameover', component: GameOverView },
    ],
  })
}

describe('GameOverView', () => {
  beforeEach(() => {
    vi.mocked(usePeerConnection).mockReturnValue({
      status: ref('idle'),
      myPeerId: ref(''),
      errorMessage: ref(''),
      role: ref(null as any),
      initHost: vi.fn(),
      connectToHost: vi.fn(),
      sendMessage: vi.fn(),
      onMessage: vi.fn(),
      onConnected: vi.fn(),
      onDisconnected: vi.fn(),
      destroy: vi.fn(),
    } as any)
  })

  it('toont winnaar-bericht als lokale speler heeft gewonnen', () => {
    resetGame()
    gameState.winner = 'host'
    gameState.role = 'host'
    const router = createTestRouter()
    const wrapper = mount(GameOverView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toContain('gewonnen')
    expect(wrapper.find('.result-icon').text()).toContain('🏆')
  })

  it('toont verlies-bericht als lokale speler heeft verloren', () => {
    resetGame()
    gameState.winner = 'host'
    gameState.role = 'guest'
    const router = createTestRouter()
    const wrapper = mount(GameOverView, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toContain('verloren')
    expect(wrapper.find('.result-icon').text()).toContain('💀')
  })

  it('"Opnieuw spelen" navigeert naar /', async () => {
    resetGame()
    gameState.winner = 'host'
    gameState.role = 'host'
    const router = createTestRouter()
    await router.push('/gameover')
    const wrapper = mount(GameOverView, { global: { plugins: [router] } })
    await wrapper.find('button.btn.primary').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
  })
})
