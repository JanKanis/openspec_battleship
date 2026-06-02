import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

// --- PeerJS mock via vi.hoisted zodat hij ook in vi.mock factory beschikbaar is ---
const peerState = vi.hoisted(() => ({
  instances: [] as any[],
}))

vi.mock('peerjs', () => {
  class MockDataConnection {
    handlers: Record<string, Function[]> = {}
    send = vi.fn()
    close = vi.fn()

    on(event: string, cb: Function) {
      ;(this.handlers[event] ??= []).push(cb)
      return this
    }

    trigger(event: string, ...args: unknown[]) {
      this.handlers[event]?.forEach((fn) => fn(...args))
    }
  }

  class MockPeer {
    handlers: Record<string, Function[]> = {}
    id = 'mock-peer-id'
    destroy = vi.fn()
    lastConn: MockDataConnection | null = null

    constructor() {
      peerState.instances.push(this)
    }

    on(event: string, cb: Function) {
      ;(this.handlers[event] ??= []).push(cb)
      return this
    }

    connect(_id: string, _opts?: unknown): MockDataConnection {
      this.lastConn = new MockDataConnection()
      return this.lastConn
    }

    trigger(event: string, ...args: unknown[]) {
      this.handlers[event]?.forEach((fn) => fn(...args))
    }
  }

  return { default: MockPeer }
})

// --- Import NADAT de mock geregistreerd is ---
import { usePeerConnection } from '../usePeerConnection'

describe('usePeerConnection', () => {
  const peer = usePeerConnection()

  beforeEach(() => {
    peerState.instances.length = 0
    vi.clearAllMocks()
  })

  afterEach(() => {
    peer.destroy()
  })

  // --- initHost ---
  describe('initHost', () => {
    it('resolveert met peer ID wanneer open event valt', async () => {
      const promise = peer.initHost()
      expect(peer.status.value).toBe('connecting')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open', 'test-id')
      const id = await promise
      expect(id).toBe('test-id')
      expect(peer.myPeerId.value).toBe('test-id')
    })

    it('status wordt connected en onConnected callback aangeroepen bij binnenkomende verbinding', async () => {
      const onConnectedCb = vi.fn()
      peer.onConnected(onConnectedCb)
      const promise = peer.initHost()
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open', 'test-id')
      await promise

      // Simuleer binnenkomende verbinding
      const mockConn = { on: vi.fn().mockReturnThis(), send: vi.fn(), close: vi.fn() } as any
      // setupConnectionHandlers registreert conn.on('open', ...)
      let openCb: Function | undefined
      mockConn.on.mockImplementation((event: string, cb: Function) => {
        if (event === 'open') openCb = cb
        return mockConn
      })
      mockPeer.trigger('connection', mockConn)
      openCb!()

      expect(peer.status.value).toBe('connected')
      expect(onConnectedCb).toHaveBeenCalled()
    })

    it('rejecteert en zet status op error bij PeerJS fout', async () => {
      const promise = peer.initHost()
      const mockPeer = peerState.instances[0]
      const err = new Error('network error')
      mockPeer.trigger('error', err)
      await expect(promise).rejects.toThrow('network error')
      expect(peer.status.value).toBe('error')
      expect(peer.errorMessage.value).toContain('PeerJS fout')
    })
  })

  // --- connectToHost ---
  describe('connectToHost', () => {
    it('resolveert wanneer verbinding opent en status is connected', async () => {
      const promise = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]

      // Trigger peer open zodat p.connect() aangeroepen wordt
      mockPeer.trigger('open')
      await Promise.resolve() // tick voor connect()

      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await promise

      expect(peer.status.value).toBe('connected')
      expect(peer.role.value).toBe('guest')
    })

    it('rejecteert bij verbindingsfout op conn', async () => {
      const promise = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()

      const conn = mockPeer.lastConn!
      const err = new Error('conn error')
      conn.trigger('error', err)
      await expect(promise).rejects.toThrow('conn error')
    })

    it('rejecteert bij PeerJS fout', async () => {
      const promise = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      const err = new Error('peer error')
      mockPeer.trigger('error', err)
      await expect(promise).rejects.toThrow('peer error')
      expect(peer.status.value).toBe('error')
      expect(peer.errorMessage.value).toContain('game-code')
    })
  })

  // --- onConnected: direct aanroepen als al verbonden ---
  describe('onConnected', () => {
    it('roept callback direct aan als status al connected is', async () => {
      // Maak verbinding
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      mockPeer.lastConn!.trigger('open')
      await p

      const cb = vi.fn()
      peer.onConnected(cb)
      expect(cb).toHaveBeenCalledOnce()
    })
  })

  // --- sendMessage ---
  describe('sendMessage', () => {
    it('stuurt bericht via de DataConnection', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      peer.sendMessage({ type: 'ready' })
      expect(conn.send).toHaveBeenCalledWith({ type: 'ready' })
    })

    it('doet niets als er geen verbinding is', () => {
      // Geen crash verwacht
      expect(() => peer.sendMessage({ type: 'ready' })).not.toThrow()
    })
  })

  // --- onMessage ---
  describe('onMessage', () => {
    it('roept callback aan bij binnenkomende data', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      const msgCb = vi.fn()
      peer.onMessage(msgCb)
      conn.trigger('data', { type: 'ready' })
      expect(msgCb).toHaveBeenCalledWith({ type: 'ready' })
    })
  })

  // --- onDisconnected ---
  describe('onDisconnected', () => {
    it('roept callback aan bij close event', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      const disconnCb = vi.fn()
      peer.onDisconnected(disconnCb)
      conn.trigger('close')
      expect(peer.status.value).toBe('disconnected')
      expect(disconnCb).toHaveBeenCalled()
    })
  })

  // --- conn error via setupConnectionHandlers ---
  describe('verbindingsfout op DataConnection', () => {
    it('zet status op error en vult errorMessage', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      conn.trigger('error', new Error('data channel error'))
      expect(peer.status.value).toBe('error')
      expect(peer.errorMessage.value).toContain('Verbindingsfout')
    })
  })

  // --- destroy ---
  describe('destroy', () => {
    it('reset alles naar beginwaarden', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      mockPeer.lastConn!.trigger('open')
      await p

      peer.destroy()
      expect(peer.status.value).toBe('idle')
      expect(peer.myPeerId.value).toBe('')
      expect(peer.errorMessage.value).toBe('')
      expect(peer.role.value).toBeNull()
    })
  })

  // --- heartbeat ---
  describe('heartbeat', () => {
    it('heartbeatLost wordt true na 15+ seconden geen bericht', async () => {
      vi.useFakeTimers()
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      expect(peer.heartbeatLost.value).toBe(false)

      vi.advanceTimersByTime(16000)
      await nextTick()

      expect(peer.heartbeatLost.value).toBe(true)
      expect(peer.secondsSinceLastHeartbeat.value).toBeGreaterThanOrEqual(15)

      vi.useRealTimers()
    })

    it('heartbeatLost reset na ontvangen bericht', async () => {
      vi.useFakeTimers()
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      // Wacht 16 seconden zodat heartbeatLost = true
      vi.advanceTimersByTime(16000)
      await nextTick()
      expect(peer.heartbeatLost.value).toBe(true)

      // Stuur een bericht — reset de timer
      conn.trigger('data', { type: 'ready' })
      vi.advanceTimersByTime(1000)
      await nextTick()

      expect(peer.heartbeatLost.value).toBe(false)
      expect(peer.secondsSinceLastHeartbeat.value).toBeLessThan(5)

      vi.useRealTimers()
    })

    it('ping bericht wordt niet doorgestuurd naar onMessage callback', async () => {
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      const msgCb = vi.fn()
      peer.onMessage(msgCb)
      conn.trigger('data', { type: 'ping' })

      expect(msgCb).not.toHaveBeenCalled()
    })

    it('destroy stopt heartbeat en reset heartbeatLost', async () => {
      vi.useFakeTimers()
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      mockPeer.lastConn!.trigger('open')
      await p

      vi.advanceTimersByTime(16000)
      await nextTick()
      expect(peer.heartbeatLost.value).toBe(true)

      peer.destroy()
      expect(peer.heartbeatLost.value).toBe(false)
      expect(peer.secondsSinceLastHeartbeat.value).toBe(0)

      vi.useRealTimers()
    })

    it('stuurt elke 10 seconden een ping', async () => {
      vi.useFakeTimers()
      const p = peer.connectToHost('host-id')
      const mockPeer = peerState.instances[0]
      mockPeer.trigger('open')
      await Promise.resolve()
      const conn = mockPeer.lastConn!
      conn.trigger('open')
      await p

      vi.advanceTimersByTime(30000)

      // 3 pings verwacht (na 10s, 20s, 30s)
      const pings = conn.send.mock.calls.filter((c: any[]) => c[0]?.type === 'ping')
      expect(pings.length).toBe(3)

      vi.useRealTimers()
    })
  })
})
