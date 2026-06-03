<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerConnection } from '../composables/usePeerConnection'
import { useLocale } from '../composables/useLocale'
import { gameState, connectionError, resetGame } from '../game/state'
import { setGameConnection, clearGameConnection } from '../composables/useGameConnection'
import { createPeerGameConnection } from '../composables/PeerGameConnection'
import { createAIConnection } from '../composables/useAIConnection'

const router = useRouter()
const peer = usePeerConnection()
const { t } = useLocale()

type Mode = 'idle' | 'hosting' | 'joining'
const mode = ref<Mode>('idle')
const guestCode = ref('')
const copied = ref(false)
const isConnecting = ref(false)

resetGame()
clearGameConnection()

async function startHost() {
  mode.value = 'hosting'
  connectionError.value = ''
  try {
    await peer.initHost()
    gameState.role = 'host'

    peer.onConnected(() => {
      setGameConnection(createPeerGameConnection())
      gameState.phase = 'placement'
      gameState.myTurn = true // host begint
      router.push('/placement')
    })

    peer.onDisconnected(() => {
      connectionError.value = t('home.errorDisconnected')
      mode.value = 'idle'
    })
  } catch {
    connectionError.value = t('home.errorHostFailed')
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
    setGameConnection(createPeerGameConnection())
    gameState.role = 'guest'
    gameState.phase = 'placement'
    gameState.myTurn = false // guest wacht

    peer.onDisconnected(() => {
      connectionError.value = t('home.errorDisconnected')
    })

    router.push('/placement')
  } catch {
    connectionError.value = t('home.errorConnectFailed')
  } finally {
    isConnecting.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(peer.myPeerId.value)
  copied.value = true
  /* c8 ignore next */
  setTimeout(() => (copied.value = false), 2000)
}

function startSolo() {
  connectionError.value = ''
  const playerGoesFirst = Math.random() < 0.5
  gameState.role = 'host'
  gameState.phase = 'placement'
  gameState.myTurn = playerGoesFirst
  setGameConnection(createAIConnection(playerGoesFirst))
  router.push('/placement')
}
</script>

<template>
  <div class="home">
    <h1>{{ t('home.title') }}</h1>
    <p class="subtitle">{{ t('home.subtitle') }}</p>

    <div v-if="connectionError" class="error">{{ connectionError }}</div>

    <!-- Startmenu -->
    <div v-if="mode === 'idle'" class="menu">
      <button class="btn primary" @click="startHost">{{ t('home.newGame') }}</button>
      <button class="btn secondary" @click="mode = 'joining'">{{ t('home.connect') }}</button>
      <button class="btn solo" @click="startSolo">{{ t('home.solo') }}</button>
    </div>

    <!-- Host wacht -->
    <div v-else-if="mode === 'hosting'" class="lobby">
      <p>{{ t('home.yourCode') }}</p>
      <div class="code-box">
        <span class="code">{{ peer.myPeerId.value || '…' }}</span>
        <button class="btn small" :disabled="!peer.myPeerId.value" @click="copyCode">
          {{ copied ? t('home.copied') : t('home.copy') }}
        </button>
      </div>
      <p class="hint">{{ t('home.sendCode') }}</p>
      <p class="waiting">{{ t('home.waiting') }}</p>
      <button class="btn ghost" @click="mode = 'idle'">{{ t('home.cancel') }}</button>
    </div>

    <!-- Guest voert code in -->
    <div v-else-if="mode === 'joining'" class="join">
      <label for="code-input">{{ t('home.codeLabel') }}</label>
      <input
        id="code-input"
        v-model="guestCode"
        type="text"
        :placeholder="t('home.codePlaceholder')"
        @keyup.enter="joinGame"
      />
      <div class="join-actions">
        <button class="btn primary" :disabled="isConnecting || !guestCode.trim()" @click="joinGame">
          {{ isConnecting ? t('home.connecting') : t('home.connect') }}
        </button>
        <button class="btn ghost" @click="mode = 'idle'">{{ t('home.back') }}</button>
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
.btn.solo { background: #f9ab00; color: white; }
.btn.ghost { background: transparent; color: #555; border: 1px solid #ccc; }
.btn.small { padding: 0.3rem 0.7rem; font-size: 0.85rem; background: #1a73e8; color: white; }
</style>
