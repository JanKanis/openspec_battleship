import { describe, it, expect, beforeEach } from 'vitest'
import { gameState, connectionError, resetGame } from '../state'

describe('gameState beginwaarden', () => {
  it('heeft de juiste beginwaarden na resetGame', () => {
    // Verander de state
    gameState.phase = 'playing'
    gameState.role = 'host'
    gameState.myTurn = true
    gameState.winner = 'guest'
    gameState.notification = 'test'
    connectionError.value = 'fout'

    resetGame()

    expect(gameState.phase).toBe('connecting')
    expect(gameState.role).toBeNull()
    expect(gameState.myTurn).toBe(false)
    expect(gameState.winner).toBeNull()
    expect(gameState.notification).toBe('')
    expect(connectionError.value).toBe('')
  })

  it('resetGame herstelt myBoard naar een leeg bord', () => {
    gameState.myBoard[0][0] = { x: 0, y: 0, state: 'hit' }
    resetGame()
    expect(gameState.myBoard[0][0].state).toBe('water')
  })

  it('resetGame herstelt opponentBoard naar een leeg bord', () => {
    gameState.opponentBoard[0][0] = { x: 0, y: 0, state: 'miss' }
    resetGame()
    expect(gameState.opponentBoard[0][0].state).toBe('water')
  })

  it('resetGame leegt myShips', () => {
    gameState.myShips = [{ id: 'x', type: 'destroyer', size: 2, orientation: 'horizontal', x: 0, y: 0, hits: 0 }]
    resetGame()
    expect(gameState.myShips).toHaveLength(0)
  })
})
