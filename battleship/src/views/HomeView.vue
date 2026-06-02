<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerConnection } from '../composables/usePeerConnection'
import { gameState, connectionError, resetGame } from '../game/state'

const router = useRouter()
const peer = usePeerConnection()

type Mode = 'idle' | 'hosting' | 'joining'
const mode = ref<Mode>('idle')
const guestCode = ref('')
const copied = ref(false)
const isConnecting = ref(false)

resetGame()

async function startHost() {
  mode.value = 'hosting'
  connectionError.value = ''
  try {
    await peer.initHost()
    gameState.role = 'host'

    peer.onConnected(() => {
      gameState.phase = 'placement'
      gameState.myTurn = true // host begint
      router.push('/placement')
    })

    peer.onDisconnected(() => {
      connectionError.value = 'Verbinding verbroken.'
      mode.value = 'idle'
    })
  } catch {
    connectionError.value = 'Kon geen lobby aanmaken. Probeer opnieuw.'
    mode.value = 'idle'
  }
}

async function joinGame() {
  const code = guestCode.value.trim()
  if (!code) return
  isConnecting.value = true
  connectionError.value = ''
  try {
    await peer.connectToHost(code)
    gameState.role = 'guest'
    gameState.phase = 'placement'
    gameState.myTurn = false // guest wacht

    peer.onDisconnected(() => {
      connectionError.value = 'Verbinding verbroken.'
    })

    router.push('/placement')
  } catch {
    connectionError.value = 'Kan niet verbinden. Controleer de game-code en probeer opnieuw.'
  } finally {
    isConnecting.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(peer.myPeerId.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="home">
    <h1>⚓ Zeeslag</h1>
    <p class="subtitle">Multiplayer Battleship via P2P</p>

    <div v-if="connectionError" class="error">{{ connectionError }}</div>

    <!-- Startmenu -->
    <div v-if="mode === 'idle'" class="menu">
      <button class="btn primary" @click="startHost">Nieuw spel</button>
      <button class="btn secondary" @click="mode = 'joining'">Verbinden</button>
    </div>

    <!-- Host wacht -->
    <div v-else-if="mode === 'hosting'" class="lobby">
      <p>Jouw game-code:</p>
      <div class="code-box">
        <span class="code">{{ peer.myPeerId.value || '…' }}</span>
        <button class="btn small" :disabled="!peer.myPeerId.value" @click="copyCode">
          {{ copied ? 'Gekopieerd!' : 'Kopieer' }}
        </button>
      </div>
      <p class="hint">Stuur deze code naar je tegenstander.</p>
      <p class="waiting">Wachten op tegenstander…</p>
      <button class="btn ghost" @click="mode = 'idle'">Annuleren</button>
    </div>

    <!-- Guest voert code in -->
    <div v-else-if="mode === 'joining'" class="join">
      <label for="code-input">Game-code:</label>
      <input
        id="code-input"
        v-model="guestCode"
        type="text"
        placeholder="Plak de code hier"
        @keyup.enter="joinGame"
      />
      <div class="join-actions">
        <button class="btn primary" :disabled="isConnecting || !guestCode.trim()" @click="joinGame">
          {{ isConnecting ? 'Verbinden…' : 'Verbinden' }}
        </button>
        <button class="btn ghost" @click="mode = 'idle'">Terug</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
  padding: 2rem;
}

h1 { font-size: 2.5rem; margin: 0; }
.subtitle { color: #666; margin: 0; }

.menu, .lobby, .join {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.code-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
}
.code {
  font-family: monospace;
  font-size: 1rem;
  word-break: break-all;
  max-width: 260px;
}

.hint { color: #888; font-size: 0.85rem; }
.waiting { font-style: italic; color: #555; }

.join label { font-weight: 600; }
.join input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  width: 280px;
}
.join-actions { display: flex; gap: 0.5rem; }

.error {
  background: #fee;
  border: 1px solid #f88;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #c00;
}

.btn {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.15s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: #1a73e8; color: white; }
.btn.secondary { background: #34a853; color: white; }
.btn.ghost { background: transparent; color: #555; border: 1px solid #ccc; }
.btn.small { padding: 0.3rem 0.7rem; font-size: 0.85rem; background: #1a73e8; color: white; }
</style>
