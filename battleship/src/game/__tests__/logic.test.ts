import { describe, it, expect } from 'vitest'
import {
  createBoard,
  getShipCells,
  isValidPlacement,
  placeShip,
  fireShot,
  checkWin,
  BOARD_SIZE,
} from '../logic'
import type { Ship } from '../types'

function makeShip(overrides: Partial<Ship> = {}): Ship {
  return {
    id: 'ship-1',
    type: 'destroyer',
    size: 2,
    orientation: 'horizontal',
    x: 0,
    y: 0,
    hits: 0,
    ...overrides,
  }
}

describe('createBoard', () => {
  it('maakt een 10×10 bord aan', () => {
    const board = createBoard()
    expect(board).toHaveLength(BOARD_SIZE)
    board.forEach((row) => expect(row).toHaveLength(BOARD_SIZE))
  })

  it('alle cellen starten als water', () => {
    const board = createBoard()
    board.forEach((row, y) =>
      row.forEach((cell, x) => {
        expect(cell).toEqual({ x, y, state: 'water' })
      }),
    )
  })
})

describe('getShipCells', () => {
  it('horizontaal: geeft de juiste cellen', () => {
    const cells = getShipCells(2, 3, 3, 'horizontal')
    expect(cells).toEqual([
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ])
  })

  it('verticaal: geeft de juiste cellen', () => {
    const cells = getShipCells(1, 0, 3, 'vertical')
    expect(cells).toEqual([
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ])
  })
})

describe('isValidPlacement', () => {
  it('geldig: schip past op leeg bord', () => {
    const board = createBoard()
    expect(isValidPlacement(board, 0, 0, 3, 'horizontal')).toBe(true)
  })

  it('ongeldig: schip steekt buiten rechterrand', () => {
    const board = createBoard()
    expect(isValidPlacement(board, 8, 0, 3, 'horizontal')).toBe(false)
  })

  it('ongeldig: schip steekt buiten onderrand', () => {
    const board = createBoard()
    expect(isValidPlacement(board, 0, 8, 3, 'vertical')).toBe(false)
  })

  it('ongeldig: overlap met bestaand schip', () => {
    const board = createBoard()
    const ship = makeShip({ size: 2, x: 1, y: 0 })
    const placedBoard = placeShip(board, ship)
    expect(isValidPlacement(placedBoard, 0, 0, 3, 'horizontal')).toBe(false)
  })
})

describe('placeShip', () => {
  it('plaatst cellen met state ship en juiste shipId', () => {
    const board = createBoard()
    const ship = makeShip({ id: 'my-ship', size: 3, x: 0, y: 0, orientation: 'horizontal' })
    const newBoard = placeShip(board, ship)
    expect(newBoard[0][0]).toEqual({ x: 0, y: 0, state: 'ship', shipId: 'my-ship' })
    expect(newBoard[0][1]).toEqual({ x: 1, y: 0, state: 'ship', shipId: 'my-ship' })
    expect(newBoard[0][2]).toEqual({ x: 2, y: 0, state: 'ship', shipId: 'my-ship' })
  })

  it('muteert het originele bord niet', () => {
    const board = createBoard()
    const ship = makeShip()
    placeShip(board, ship)
    expect(board[0][0].state).toBe('water')
  })
})

describe('fireShot', () => {
  it('mis: raakt een lege cel', () => {
    const board = createBoard()
    const { hit, sunk, newBoard } = fireShot(board, [], 0, 0)
    expect(hit).toBe(false)
    expect(sunk).toBeUndefined()
    expect(newBoard[0][0].state).toBe('miss')
  })

  it('raak: raakt een scheepscel', () => {
    const board = createBoard()
    const ship = makeShip({ id: 's1', size: 2, x: 0, y: 0 })
    const placed = placeShip(board, ship)
    const ships = [ship]
    const { hit, sunk } = fireShot(placed, ships, 0, 0)
    expect(hit).toBe(true)
    expect(sunk).toBeUndefined() // nog niet gezonken (hits=0, size=2)
  })

  it('gezonken: laatste cel van een schip geraakt', () => {
    const board = createBoard()
    const ship = makeShip({ id: 's1', type: 'destroyer', size: 2, x: 0, y: 0, hits: 1 })
    const placed = placeShip(board, ship)
    const { hit, sunk } = fireShot(placed, [ship], 1, 0)
    expect(hit).toBe(true)
    expect(sunk).toBe('destroyer')
  })

  it('al geraakt (hit): retourneert hit false, bord ongewijzigd', () => {
    const board = createBoard()
    board[0][0] = { x: 0, y: 0, state: 'hit' }
    const { hit, newBoard } = fireShot(board, [], 0, 0)
    expect(hit).toBe(false)
    expect(newBoard[0][0].state).toBe('hit')
  })

  it('raak op één schip laat andere schepen ongewijzigd', () => {
    const board = createBoard()
    const ship1 = makeShip({ id: 's1', size: 2, x: 0, y: 0 })
    const ship2 = makeShip({ id: 's2', type: 'cruiser' as any, size: 3, x: 0, y: 2 })
    const placed = placeShip(placeShip(board, ship1), ship2)
    const { newShips } = fireShot(placed, [ship1, ship2], 0, 0)
    expect(newShips.find((s) => s.id === 's1')!.hits).toBe(1)
    expect(newShips.find((s) => s.id === 's2')!.hits).toBe(0)
  })

  it('al geraakt (miss): retourneert hit false, bord ongewijzigd', () => {
    const board = createBoard()
    board[0][0] = { x: 0, y: 0, state: 'miss' }
    const { hit, newBoard } = fireShot(board, [], 0, 0)
    expect(hit).toBe(false)
    expect(newBoard[0][0].state).toBe('miss')
  })
})

describe('checkWin', () => {
  it('niet gewonnen als er schepen over zijn', () => {
    const ships: Ship[] = [makeShip({ size: 2, hits: 1 })]
    expect(checkWin(ships)).toBe(false)
  })

  it('gewonnen als alle schepen gezonken zijn', () => {
    const ships: Ship[] = [makeShip({ size: 2, hits: 2 })]
    expect(checkWin(ships)).toBe(true)
  })

  it('gewonnen als er geen schepen zijn', () => {
    expect(checkWin([])).toBe(true)
  })
})
