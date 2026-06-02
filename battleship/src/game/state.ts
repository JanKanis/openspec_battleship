import { ref, reactive } from 'vue'
import type { Board, Ship, GamePhase, PlayerRole } from '../game/types'
import { createBoard } from '../game/logic'

// Globale spelstate — gedeeld tussen alle views
export const gameState = reactive({
  phase: 'connecting' as GamePhase,
  role: null as PlayerRole | null,

  // Eigen bord (met schepen zichtbaar)
  myBoard: createBoard() as Board,
  myShips: [] as Ship[],

  // Tegenstander bord (alleen raak/mis zichtbaar)
  opponentBoard: createBoard() as Board,

  // Wiens beurt is het
  myTurn: false,

  // Eindstand
  winner: null as PlayerRole | null,

  // Melding (bijv. "Carrier gezonken!")
  notification: '' as string,
})

export const connectionError = ref('')

export function resetGame() {
  gameState.phase = 'connecting'
  gameState.role = null
  gameState.myBoard = createBoard()
  gameState.myShips = []
  gameState.opponentBoard = createBoard()
  gameState.myTurn = false
  gameState.winner = null
  gameState.notification = ''
  connectionError.value = ''
}
