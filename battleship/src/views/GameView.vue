<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GameBoard from '../components/GameBoard.vue'
import { gameState } from '../game/state'
import { usePeerConnection } from '../composables/usePeerConnection'
import { fireShot, checkWin } from '../game/logic'
import { SHIP_DEFINITIONS } from '../game/types'

const router = useRouter()
const peer = usePeerConnection()

const notification = ref('')

function showNotification(msg: string) {
  notification.value = msg
  setTimeout(() => (notification.value = ''), 3000)
}

function shipName(type: string): string {
  /* c8 ignore next */
  return SHIP_DEFINITIONS.find((d) => d.type === type)?.name ?? type
}

// Schoten op het bord van de tegenstander (door lokale speler)
function handleOpponentCellClick(x: number, y: number) {
  /* c8 ignore next */
  if (!gameState.myTurn) return
  const cell = gameState.opponentBoard[y]?.[x]
  if (!cell || cell.state === 'hit' || cell.state === 'miss') return

  peer.sendMessage({ type: 'shot', x, y })
  gameState.myTurn = false
}

// Verwerk een binnenkomend schot op het eigen bord en stuur het resultaat terug
function processIncomingShot(x: number, y: number) {
  const { hit, sunk, newBoard, newShips } = fireShot(gameState.myBoard, gameState.myShips, x, y)
  gameState.myBoard = newBoard
  gameState.myShips = newShips

  peer.sendMessage({ type: 'shot-result', x, y, hit, sunk })

  if (sunk) showNotification(`Jouw ${shipName(sunk)} is gezonken!`)

  if (checkWin(newShips)) {
    const winner = gameState.role === 'host' ? 'guest' : 'host'
    peer.sendMessage({ type: 'game-over', winner })
    gameState.winner = winner
    gameState.phase = 'gameover'
    router.push('/gameover')
    return
  }

  gameState.myTurn = !hit // raak = tegenstander mag nog een keer
}

// Verwerk inkomende berichten
peer.onMessage((msg) => {
  if (msg.type === 'shot') {
    processIncomingShot(msg.x, msg.y)
  }

  if (msg.type === 'shot-result') {
    // Update het opponentBoard (de schutter is de lokale speler)
    const { hit, sunk, newBoard, newShips } = fireShot(
      gameState.opponentBoard,
      [], // opponentBoard heeft geen ships array — we updaten enkel de cel
      msg.x,
      msg.y,
    )
    // Handmatig updaten want we kennen het schip van de tegenstander niet
    const updatedBoard = gameState.opponentBoard.map((row) => row.map((cell) => ({ ...cell })))
    const row = updatedBoard[msg.y]
    const existing = row?.[msg.x]
    /* c8 ignore next */
    if (row && existing) {
      row[msg.x] = { x: msg.x, y: msg.y, state: msg.hit ? 'hit' : 'miss' }
    }
    gameState.opponentBoard = updatedBoard

    if (msg.sunk) showNotification(`${shipName(msg.sunk)} van de tegenstander gezonken!`)

    gameState.myTurn = msg.hit // raak = zelfde speler mag nog een keer
  }

  if (msg.type === 'game-over') {
    gameState.winner = msg.winner
    gameState.phase = 'gameover'
    router.push('/gameover')
  }
})

peer.onDisconnected(() => {
  showNotification('Verbinding verbroken — spel beëindigd.')
  setTimeout(() => router.push('/'), 2000)
})
</script>

<template>
  <div class="game">
    <div class="turn-indicator" :class="{ active: gameState.myTurn }">
      {{ gameState.myTurn ? 'Jouw beurt' : 'Tegenstander is aan de beurt…' }}
    </div>

    <div v-if="notification" class="notification">{{ notification }}</div>

    <div class="boards">
      <div class="board-section">
        <h3>Jouw bord</h3>
        <GameBoard
          :board="gameState.myBoard"
          :show-ships="true"
          :interactive="false"
        />
      </div>

      <div class="board-section">
        <h3>Tegenstander</h3>
        <GameBoard
          :board="gameState.opponentBoard"
          :show-ships="false"
          :interactive="gameState.myTurn"
          @cell-click="handleOpponentCellClick"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.turn-indicator {
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
  background: #f0f0f0;
  color: #555;
  transition: background 0.2s, color 0.2s;
}
.turn-indicator.active {
  background: #1a73e8;
  color: white;
}

.notification {
  background: #fffbe6;
  border: 1px solid #f0c040;
  border-radius: 6px;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}

.boards {
  display: flex;
  gap: 3rem;
  flex-wrap: wrap;
  justify-content: center;
}

.board-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.board-section h3 { margin: 0; font-size: 1rem; color: #444; }
</style>
