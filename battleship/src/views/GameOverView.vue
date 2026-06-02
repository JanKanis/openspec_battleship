<script setup lang="ts">
import { useRouter } from 'vue-router'
import { gameState, resetGame } from '../game/state'
import { usePeerConnection } from '../composables/usePeerConnection'

const router = useRouter()
const peer = usePeerConnection()

const won = gameState.winner === gameState.role

function playAgain() {
  peer.destroy()
  resetGame()
  router.push('/')
}
</script>

<template>
  <div class="gameover">
    <div class="result-card">
      <div class="result-icon">{{ won ? '🏆' : '💀' }}</div>
      <h1>{{ won ? 'Je hebt gewonnen!' : 'Je hebt verloren.' }}</h1>
      <p class="sub">{{ won ? 'Alle schepen van de tegenstander zijn gezonken.' : 'Al jouw schepen zijn gezonken.' }}</p>
      <button class="btn primary" @click="playAgain">Opnieuw spelen</button>
    </div>
  </div>
</template>

<style scoped>
.gameover {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  padding: 3rem 4rem;
  text-align: center;
}

.result-icon { font-size: 4rem; }
h1 { margin: 0; font-size: 2rem; }
.sub { color: #666; margin: 0; }

.btn {
  padding: 0.7rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}
.btn.primary { background: #1a73e8; color: white; }
</style>
