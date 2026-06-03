import type { Board, Ship, ShipType, Orientation } from './types'
import { SHIP_DEFINITIONS } from './types'
import { createBoard, isValidPlacement, placeShip, BOARD_SIZE } from './logic'
import { fireShot } from './logic'

export { fireShot }

// Willekeurig scheepsbord genereren
export function randomBoard(): { board: Board; ships: Ship[] } {
  let board = createBoard()
  const ships: Ship[] = []

  for (let i = 0; i < SHIP_DEFINITIONS.length; i++) {
    const def = SHIP_DEFINITIONS[i]!
    let placed = false
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical'
      const x = Math.floor(Math.random() * BOARD_SIZE)
      const y = Math.floor(Math.random() * BOARD_SIZE)
      if (isValidPlacement(board, x, y, def.size, orientation)) {
        const ship: Ship = {
          id: `ai-ship-${i}`,
          type: def.type,
          size: def.size,
          orientation,
          x,
          y,
          hits: 0,
        }
        board = placeShip(board, ship)
        ships.push(ship)
        placed = true
      }
    }
  }

  return { board, ships }
}

interface AIState {
  mode: 'hunt' | 'target'
  hitStack: { x: number; y: number }[]
  targetQueue: { x: number; y: number }[]
  shotCells: Set<string>
  remainingShips: ShipType[]
}

export interface AI {
  nextShot(): { x: number; y: number }
  processResult(x: number, y: number, hit: boolean, sunk?: ShipType): void
}

export function createAI(remainingShips: ShipType[]): AI {
  const state: AIState = {
    mode: 'hunt',
    hitStack: [],
    targetQueue: [],
    shotCells: new Set(),
    remainingShips: [...remainingShips],
  }

  function computeProbabilityMap(): number[][] {
    const map: number[][] = Array.from({ length: BOARD_SIZE }, (): number[] => new Array<number>(BOARD_SIZE).fill(0))
    const inc = (y: number, x: number) => { const row = map[y] as number[]; row[x] = (row[x] as number) + 1 }

    for (const shipType of state.remainingShips) {
      const def = SHIP_DEFINITIONS.find((d) => d.type === shipType)!
      const size = def.size

      // Horizontaal
      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x <= BOARD_SIZE - size; x++) {
          const cells = Array.from({ length: size }, (_, i) => ({ x: x + i, y }))
          const valid = cells.every((c) => {
            const key = `${c.x},${c.y}`
            if (!state.shotCells.has(key)) return true
            return state.hitStack.some((h) => h.x === c.x && h.y === c.y)
          })
          if (valid) {
            for (const c of cells) inc(c.y, c.x)
          }
        }
      }

      // Verticaal
      for (let y = 0; y <= BOARD_SIZE - size; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          const cells = Array.from({ length: size }, (_, i) => ({ x, y: y + i }))
          const valid = cells.every((c) => {
            const key = `${c.x},${c.y}`
            if (!state.shotCells.has(key)) return true
            return state.hitStack.some((h) => h.x === c.x && h.y === c.y)
          })
          if (valid) {
            for (const c of cells) inc(c.y, c.x)
          }
        }
      }
    }

    return map
  }

  function nextShot(): { x: number; y: number } {
    // Target modus: buurcellen afwerken
    if (state.mode === 'target') {
      while (state.targetQueue.length > 0) {
        const candidate = state.targetQueue.shift()!
        const key = `${candidate.x},${candidate.y}`
        if (!state.shotCells.has(key)) {
          return candidate
        }
      }
      // Queue leeg — terugval naar hunt
      state.mode = 'hunt'
    }

    // Hunt modus: hoogste kanscel
    const map = computeProbabilityMap()
    let bestX = 0
    let bestY = 0
    let bestScore = -1
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const key = `${x},${y}`
        /* c8 ignore next 2 */
        if (!state.shotCells.has(key) && (map[y] as number[])[x] as number > bestScore) {
          bestScore = (map[y] as number[])[x] as number
          bestX = x
          bestY = y
        }
      }
    }
    return { x: bestX, y: bestY }
  }

  function processResult(x: number, y: number, hit: boolean, sunk?: ShipType): void {
    state.shotCells.add(`${x},${y}`)

    if (sunk) {
      // Schip gezonken: verwijder uit remainingShips, reset hit-tracking
      const idx = state.remainingShips.indexOf(sunk)
      /* c8 ignore next */
      if (idx !== -1) state.remainingShips.splice(idx, 1)
      state.hitStack = []
      state.targetQueue = []
      state.mode = 'hunt'
    } else if (hit) {
      // Raak maar niet gezonken: ga naar target modus
      state.hitStack.push({ x, y })
      state.mode = 'target'

      // Voeg buurcellen toe aan de queue
      const neighbors = [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ].filter((c) => c.x >= 0 && c.x < BOARD_SIZE && c.y >= 0 && c.y < BOARD_SIZE)

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`
        if (!state.shotCells.has(key) && !state.targetQueue.some((q) => q.x === n.x && q.y === n.y)) {
          state.targetQueue.push(n)
        }
      }
    }
    // Miss: niets extra doen — targetQueue wordt in nextShot afgewerkt
  }

  return { nextShot, processResult }
}
