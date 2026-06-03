import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { createPeerGameConnection } from '../PeerGameConnection'
import { usePeerConnection } from '../usePeerConnection'

vi.mock('../usePeerConnection')

function createMockPeer() {
  return {
    status: ref('connected'),
    myPeerId: ref('test'),
    errorMessage: ref(''),
    role: ref(null),
    heartbeatLost: ref(false),
    secondsSinceLastHeartbeat: ref(0),
    sendMessage: vi.fn(),
    onMessage: vi.fn(),
    onConnected: vi.fn(),
    onDisconnected: vi.fn(),
    destroy: vi.fn(),
    initHost: vi.fn(),
    connectToHost: vi.fn(),
  }
}

describe('createPeerGameConnection', () => {
  let mockPeer: ReturnType<typeof createMockPeer>

  beforeEach(() => {
    mockPeer = createMockPeer()
    vi.mocked(usePeerConnection).mockReturnValue(mockPeer as any)
  })

  it('isAI is false', () => {
    const conn = createPeerGameConnection()
    expect(conn.isAI).toBe(false)
  })

  it('sendMessage delegeert naar peer', () => {
    const conn = createPeerGameConnection()
    conn.sendMessage({ type: 'ping' })
    expect(mockPeer.sendMessage).toHaveBeenCalledWith({ type: 'ping' })
  })

  it('onMessage delegeert naar peer', () => {
    const conn = createPeerGameConnection()
    const cb = vi.fn()
    conn.onMessage(cb)
    expect(mockPeer.onMessage).toHaveBeenCalledWith(cb)
  })

  it('onDisconnected delegeert naar peer', () => {
    const conn = createPeerGameConnection()
    const cb = vi.fn()
    conn.onDisconnected(cb)
    expect(mockPeer.onDisconnected).toHaveBeenCalledWith(cb)
  })

  it('destroy delegeert naar peer', () => {
    const conn = createPeerGameConnection()
    conn.destroy()
    expect(mockPeer.destroy).toHaveBeenCalled()
  })

  it('heartbeatLost retourneert peer.heartbeatLost', () => {
    mockPeer.heartbeatLost.value = true
    const conn = createPeerGameConnection()
    expect(conn.heartbeatLost.value).toBe(true)
  })

  it('secondsSinceLastHeartbeat retourneert peer.secondsSinceLastHeartbeat', () => {
    mockPeer.secondsSinceLastHeartbeat.value = 12
    const conn = createPeerGameConnection()
    expect(conn.secondsSinceLastHeartbeat.value).toBe(12)
  })
})
