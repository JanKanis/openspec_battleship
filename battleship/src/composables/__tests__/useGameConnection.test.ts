import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { setGameConnection, useGameConnection, clearGameConnection } from '../useGameConnection'
import type { GameConnection } from '../useGameConnection'

function createMockConnection(overrides: Partial<GameConnection> = {}): GameConnection {
  return {
    sendMessage: () => {},
    onMessage: () => {},
    onDisconnected: () => {},
    destroy: () => {},
    heartbeatLost: ref(false),
    secondsSinceLastHeartbeat: ref(0),
    isAI: false,
    ...overrides,
  }
}

describe('useGameConnection', () => {
  beforeEach(() => {
    clearGameConnection()
  })

  it('gooit een fout als er geen actieve verbinding is', () => {
    expect(() => useGameConnection()).toThrow('Geen actieve GameConnection')
  })

  it('retourneert de actieve verbinding na setGameConnection', () => {
    const conn = createMockConnection()
    setGameConnection(conn)
    expect(useGameConnection()).toBe(conn)
  })

  it('clearGameConnection reset de actieve verbinding', () => {
    const conn = createMockConnection()
    setGameConnection(conn)
    clearGameConnection()
    expect(() => useGameConnection()).toThrow()
  })

  it('setGameConnection overschrijft een bestaande verbinding', () => {
    const conn1 = createMockConnection()
    const conn2 = createMockConnection({ isAI: true })
    setGameConnection(conn1)
    setGameConnection(conn2)
    expect(useGameConnection().isAI).toBe(true)
  })
})
