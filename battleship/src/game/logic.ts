import type { Board, Cell, Ship, ShipType, Orientation } from './types'

export const BOARD_SIZE = 10

// Maak een leeg 10×10 bord
export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, (_, y) =>
    Array.from({ length: BOARD_SIZE }, (_, x): Cell => ({ x, y, state: 'water' })),
  )
}

// Geeft de cellen die een schip zou bezetten bij plaatsing op (x, y)
export function getShipCells(
  x: number,
  y: number,
  size: number,
  orientation: Orientation,
): { x: number; y: number }[] {
  return Array.from({ length: size }, (_, i) => ({
    x: orientation === 'horizontal' ? x + i : x,
    y: orientation === 'vertical' ? y + i : y,
  }))
}

// Controleer of plaatsing geldig is
export function isValidPlacement(board: Board, x: number, y: number, size: number, orientation: Orientation): boolean {
  const cells = getShipCells(x, y, size, orientation)
  return cells.every((c) => {
    if (c.x < 0 || c.x >= BOARD_SIZE || c.y < 0 || c.y >= BOARD_SIZE) return false
    const row = board[c.y]
    const cell = row?.[c.x]
    /* c8 ignore next */
    if (!cell) return false
    return cell.state === 'water' && cell.shipId === undefined
  })
}

// Plaats een schip op het bord (retourneert nieuw bord)
export function placeShip(board: Board, ship: Ship): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  const cells = getShipCells(ship.x, ship.y, ship.size, ship.orientation)
  for (const c of cells) {
    const row = newBoard[c.y]
    const existing = row?.[c.x]
    /* c8 ignore next */
    if (row && existing) {
      row[c.x] = { x: c.x, y: c.y, state: 'ship', shipId: ship.id }
    }
  }
  return newBoard
}

// Verwerk een schot op het bord van de verdediger
export function fireShot(
  board: Board,
  ships: Ship[],
  x: number,
  y: number,
): { hit: boolean; sunk?: ShipType; newBoard: Board; newShips: Ship[] } {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  const row = newBoard[y]
  const cell = row?.[x]

  if (!cell || cell.state === 'hit' || cell.state === 'miss') {
    return { hit: false, newBoard, newShips: ships }
  }

  const hit = cell.state === 'ship'
  /* c8 ignore next */
  if (row) {
    row[x] = { x, y, state: hit ? 'hit' : 'miss', shipId: cell.shipId }
  }

  let sunk: ShipType | undefined
  let newShips = ships

  if (hit && cell.shipId) {
    const shipId = cell.shipId
    newShips = ships.map((s) => (s.id === shipId ? { ...s, hits: s.hits + 1 } : s))
    const ship = newShips.find((s) => s.id === shipId)
    if (ship && ship.hits >= ship.size) {
      sunk = ship.type
    }
  }

  return { hit, sunk, newBoard, newShips }
}

// Controleer of alle schepen gezonken zijn (win conditie)
export function checkWin(ships: Ship[]): boolean {
  return ships.every((s) => s.hits >= s.size)
}
