import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAIConnection } from '../useAIConnection'

// Mock AI logica en randomBoard zodat tests deterministisch zijn
vi.mock('../../game/ai', () => {
  const mockAI = {
    nextShot: vi.fn().mockReturnValue({ x: 3, y: 3 }),
    processResult: vi.fn(),
  }
  return {
    randomBoard: vi.fn(() => ({
      board: Array.from({ length: 10 }, (_, y) =>
        Array.from({ length: 10 }, (_, x) => ({ x, y, state: 'water' })),
      ),
      ships: [
        { id: 'ai-ship-0', type: 'destroyer', size: 2, orientation: 'horizontal', x: 0, y: 0, hits: 0 },
      ],
    })),
    createAI: vi.fn(() => mockAI),
  }
})

// Mock fireShot en checkWin
vi.mock('../../game/logic', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../game/logic')>()
  return {
    ...actual,
    fireShot: vi.fn(() => ({ hit: false, sunk: undefined, newBoard: [], newShips: [] })),
    checkWin: vi.fn(() => false),
  }
})

import { fireShot, checkWin } from '../../game/logic'
import { createAI } from '../../game/ai'

describe('createAIConnection', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    // Reset mock defaults
    vi.mocked(fireShot).mockReturnValue({ hit: false, sunk: undefined, newBoard: [], newShips: [] })
    vi.mocked(checkWin).mockReturnValue(false)
    vi.mocked(createAI).mockReturnValue({
      nextShot: vi.fn().mockReturnValue({ x: 3, y: 3 }),
      processResult: vi.fn(),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('heartbeatLost is altijd false', () => {
    const conn = createAIConnection(true)
    expect(conn.heartbeatLost.value).toBe(false)
  })

  it('secondsSinceLastHeartbeat is altijd 0', () => {
    const conn = createAIConnection(true)
    expect(conn.secondsSinceLastHeartbeat.value).toBe(0)
  })

  it('isAI is true', () => {
    const conn = createAIConnection(true)
    expect(conn.isAI).toBe(true)
  })

  it('sendMessage ready → AI stuurt ready terug', () => {
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'ready' })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledWith({ type: 'ready' })
  })

  it('speler begint eerst → AI schiet NIET na ready', () => {
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'ready' })
    vi.runAllTimers()
    // Enkel ready, geen shot
    expect(onMsg).toHaveBeenCalledTimes(1)
    expect(onMsg).toHaveBeenCalledWith({ type: 'ready' })
  })

  it('AI begint eerst → AI schiet na ready', () => {
    const conn = createAIConnection(false)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'ready' })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledTimes(2)
    expect(onMsg).toHaveBeenCalledWith({ type: 'ready' })
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot', x: 3, y: 3 })
  })

  it('sendMessage shot (mis) → shot-result terug + AI schiet daarna', () => {
    vi.mocked(fireShot).mockReturnValue({ hit: false, sunk: undefined, newBoard: [], newShips: [] })
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot', x: 5, y: 5 })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot-result', x: 5, y: 5, hit: false })
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot', x: 3, y: 3 })
  })

  it('sendMessage shot (raak) → shot-result terug, AI schiet NIET', () => {
    vi.mocked(fireShot).mockReturnValue({ hit: true, sunk: undefined, newBoard: [], newShips: [] })
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot', x: 5, y: 5 })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot-result', x: 5, y: 5, hit: true })
    // Geen shot van AI — speler mag nog een keer
    const shotCalls = onMsg.mock.calls.filter((c) => c[0].type === 'shot')
    expect(shotCalls).toHaveLength(0)
  })

  it('sendMessage shot (raak + gezonken) → shot-result met sunk', () => {
    vi.mocked(fireShot).mockReturnValue({ hit: true, sunk: 'destroyer', newBoard: [], newShips: [] })
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot', x: 0, y: 0 })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot-result', x: 0, y: 0, hit: true, sunk: 'destroyer' })
  })

  it('sendMessage shot → game-over als alle AI schepen gezonken zijn', () => {
    vi.mocked(fireShot).mockReturnValue({ hit: true, sunk: 'destroyer', newBoard: [], newShips: [] })
    vi.mocked(checkWin).mockReturnValue(true)
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot', x: 0, y: 0 })
    vi.runAllTimers()
    expect(onMsg).toHaveBeenCalledWith({ type: 'game-over', winner: 'host' })
  })

  it('sendMessage shot-result (raak) → AI schiet opnieuw', () => {
    const mockAIInstance = { nextShot: vi.fn().mockReturnValue({ x: 4, y: 4 }), processResult: vi.fn() }
    vi.mocked(createAI).mockReturnValue(mockAIInstance)
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot-result', x: 2, y: 2, hit: true })
    vi.runAllTimers()
    expect(mockAIInstance.processResult).toHaveBeenCalledWith(2, 2, true, undefined)
    expect(onMsg).toHaveBeenCalledWith({ type: 'shot', x: 4, y: 4 })
  })

  it('sendMessage shot-result (mis) → AI schiet NIET opnieuw', () => {
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'shot-result', x: 2, y: 2, hit: false })
    vi.runAllTimers()
    expect(onMsg).not.toHaveBeenCalled()
  })

  it('destroy → geen berichten meer na destroy', () => {
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.destroy()
    conn.sendMessage({ type: 'ready' })
    vi.runAllTimers()
    expect(onMsg).not.toHaveBeenCalled()
  })

  it('onDisconnected callback wordt nooit aangeroepen', () => {
    const conn = createAIConnection(true)
    const onDisconn = vi.fn()
    conn.onDisconnected(onDisconn)
    vi.runAllTimers()
    expect(onDisconn).not.toHaveBeenCalled()
  })

  it('sendMessage game-over → wordt genegeerd (geen callback)', () => {
    const conn = createAIConnection(true)
    const onMsg = vi.fn()
    conn.onMessage(onMsg)
    conn.sendMessage({ type: 'game-over', winner: 'host' })
    vi.runAllTimers()
    expect(onMsg).not.toHaveBeenCalled()
  })
})
