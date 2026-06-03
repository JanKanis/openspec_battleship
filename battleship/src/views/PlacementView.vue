<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GameBoard from '../components/GameBoard.vue'
import ConnectionWarning from '../components/ConnectionWarning.vue'
import { gameState } from '../game/state'
import { usePeerConnection as _usePeerConnection } from '../composables/usePeerConnection'
import { useGameConnection } from '../composables/useGameConnection'
import { useLocale } from '../composables/useLocale'
import { SHIP_DEFINITIONS, type ShipType, type Orientation, type Ship } from '../game/types'
import { isValidPlacement, placeShip, createBoard } from '../game/logic'

const router = useRouter()
const peer = useGameConnection()
const { t } = useLocale()

// Schepen lijst met plaatsingsstatus
const ships = ref(
  SHIP_DEFINITIONS.map((def, i): Ship & { placed: boolean } => ({
    id: `ship-${i}`,
    type: def.type as ShipType,
    size: def.size,
    orientation: 'horizontal' as Orientation,
    x: 0,
    y: 0,
    hits: 0,
    placed: false,
  })),
)

const selectedShipId = ref<string | null>(null)
const orientation = ref<Orientation>('horizontal')
const hoverX = ref<number | undefined>(undefined)
const hoverY = ref<number | undefined>(undefined)
const board = ref(createBoard())
const waitingForOpponent = ref(false)
const opponentReady = ref(false)

const selectedShip = computed(() => ships.value.find((s) => s.id === selectedShipId.value))
const allPlaced = computed(() => ships.value.every((s) => s.placed))

const previewValid = computed(() => {
  if (!selectedShip.value || hoverX.value === undefined || hoverY.value === undefined) return false
  return isValidPlacement(board.value, hoverX.value, hoverY.value, selectedShip.value.size, orientation.value)
})

function selectShip(id: string) {
  const ship = ships.value.find((s) => s.id === id)
  if (!ship || ship.placed) return
  selectedShipId.value = id
}

function handleCellClick(x: number, y: number) {
  if (!selectedShip.value) return
  /* c8 ignore next */
  if (!isValidPlacement(board.value, x, y, selectedShip.value.size, orientation.value)) return

  const ship: Ship = { ...selectedShip.value, x, y, orientation: orientation.value }
  board.value = placeShip(board.value, ship)

  ships.value = ships.value.map((s) =>
    s.id === ship.id ? { ...s, x, y, orientation: orientation.value, placed: true } : s,
  )
  gameState.myShips = ships.value.map((s) => ({ ...s }))
  selectedShipId.value = null
}

function handleCellHover(x: number, y: number) {
  hoverX.value = x
  hoverY.value = y
}

function handleBoardLeave() {
  hoverX.value = undefined
  hoverY.value = undefined
}

function toggleOrientation() {
  orientation.value = orientation.value === 'horizontal' ? 'vertical' : 'horizontal'
}

async function confirmReady() {
  gameState.myBoard = board.value
  gameState.myShips = ships.value.map((s) => ({ ...s }))
  waitingForOpponent.value = true

  peer.sendMessage({ type: 'ready' })

  if (opponentReady.value) {
    startGame()
  }
}

function startGame() {
  gameState.phase = 'playing'
  router.push('/game')
}

// Luister op ready van tegenstander
peer.onMessage((msg) => {
  /* c8 ignore next */
  if (msg.type === 'ready') {
    opponentReady.value = true
    if (waitingForOpponent.value) {
      startGame()
    }
  }
})

peer.onDisconnected(() => {
  router.push('/')
})

// R toets voor roteren
function onKeyDown(e: KeyboardEvent) {
  /* c8 ignore next */
  if (e.key === 'r' || e.key === 'R') toggleOrientation()
}
onMounted(() => window.addEventListener('keydown', onKeyDown))
/* c8 ignore next */
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <div class="placement">
    <h2>{{ t('placement.title') }}</h2>
    <p class="hint">{{ t('placement.hint') }}</p>

    <ConnectionWarning
      v-if="!peer.isAI && peer.heartbeatLost.value"
      :seconds-since-last-heartbeat="peer.secondsSinceLastHeartbeat.value"
    />

    <div v-if="waitingForOpponent" class="waiting-overlay">
      <p>{{ t('placement.waiting') }}</p>
    </div>

    <div class="layout">
      <!-- Schepen lijst -->
      <div class="ship-list">
        <h3>{{ t('placement.ships') }}</h3>
        <div
          v-for="ship in ships"
          :key="ship.id"
          :class="['ship-item', { selected: selectedShipId === ship.id, placed: ship.placed }]"
          @click="selectShip(ship.id)"
        >
          <span class="ship-name">{{ t('ships.' + ship.type) }}</span>
          <span class="ship-size">{{ ship.size }} {{ t('placement.cells') }}</span>
          <span v-if="ship.placed" class="ship-status">✓</span>
        </div>

        <div class="controls">
          <button class="btn secondary" @click="toggleOrientation">
            {{ t('placement.rotate') }} ({{ orientation === 'horizontal' ? '↔' : '↕' }}) <kbd>R</kbd>
          </button>
        </div>

        <button
          v-if="allPlaced && !waitingForOpponent"
          class="btn primary"
          @click="confirmReady"
        >
          {{ t('placement.ready') }}
        </button>
      </div>

      <!-- Bord -->
      <GameBoard
        :board="board"
        :show-ships="true"
        :interactive="!!selectedShip && !waitingForOpponent"
        :preview-x="hoverX"
        :preview-y="hoverY"
        :preview-size="selectedShip?.size"
        :preview-orientation="orientation"
        :preview-valid="previewValid"
        @cell-click="handleCellClick"
        @cell-hover="handleCellHover"
        @board-leave="handleBoardLeave"
      />
    </div>
  </div>
</template>

<style scoped>
.placement {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

h2 { margin: 0; }
.hint { color: #666; font-size: 0.85rem; margin: 0; }

.layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.ship-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 160px;
}

.ship-list h3 { margin: 0 0 0.25rem; }

.ship-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border: 2px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.ship-item:hover:not(.placed) { border-color: #1a73e8; background: #e8f0fe; }
.ship-item.selected { border-color: #1a73e8; background: #e8f0fe; font-weight: 600; }
.ship-item.placed { opacity: 0.5; cursor: default; }

.ship-name { flex: 1; font-size: 0.9rem; }
.ship-size { font-size: 0.75rem; color: #888; }
.ship-status { color: #34a853; font-weight: bold; }

.controls { margin-top: 0.5rem; }

kbd {
  font-size: 0.7rem;
  background: #eee;
  border: 1px solid #aaa;
  border-radius: 3px;
  padding: 0 3px;
}

.waiting-overlay {
  background: rgba(0,0,0,0.05);
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 1.5rem;
  font-style: italic;
  color: #555;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn.primary { background: #1a73e8; color: white; }
.btn.secondary { background: #f0f0f0; color: #333; border: 1px solid #ccc; }
</style>
