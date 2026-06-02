// Types voor het Battleship spel

export type CellState = 'water' | 'ship' | 'hit' | 'miss'

export interface Cell {
  x: number
  y: number
  state: CellState
  shipId?: string
}

export type ShipType = 'carrier' | 'battleship' | 'cruiser' | 'submarine' | 'destroyer'

export type Orientation = 'horizontal' | 'vertical'

export interface Ship {
  id: string
  type: ShipType
  size: number
  orientation: Orientation
  x: number // top-left kolom (0-9)
  y: number // top-left rij (0-9)
  hits: number
}

export type Board = Cell[][]

export type GamePhase = 'connecting' | 'placement' | 'playing' | 'gameover'

export type PlayerRole = 'host' | 'guest'

// PeerJS berichten — discriminated union
export type GameMessage =
  | { type: 'ready' }
  | { type: 'shot'; x: number; y: number }
  | { type: 'shot-result'; x: number; y: number; hit: boolean; sunk?: ShipType }
  | { type: 'game-over'; winner: 'host' | 'guest' }

// Vaste ship definities
export const SHIP_DEFINITIONS: { type: ShipType; name: string; size: number }[] = [
  { type: 'carrier', name: 'Carrier', size: 5 },
  { type: 'battleship', name: 'Battleship', size: 4 },
  { type: 'cruiser', name: 'Cruiser', size: 3 },
  { type: 'submarine', name: 'Submarine', size: 3 },
  { type: 'destroyer', name: 'Destroyer', size: 2 },
]
