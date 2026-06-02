<script setup lang="ts">
import type { Board } from '../game/types'
import { BOARD_SIZE, getShipCells } from '../game/logic'

const props = defineProps<{
  board: Board
  // Plaatsingsfase preview
  previewX?: number
  previewY?: number
  previewSize?: number
  previewOrientation?: 'horizontal' | 'vertical'
  previewValid?: boolean
  // Of het bord klikbaar is
  interactive?: boolean
  // Of schepen zichtbaar zijn (eigen bord)
  showShips?: boolean
}>()

const emit = defineEmits<{
  cellClick: [x: number, y: number]
  cellHover: [x: number, y: number]
  boardLeave: []
}>()

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function isPreviewCell(x: number, y: number): boolean {
  if (props.previewX === undefined || props.previewY === undefined) return false
  const cells = getShipCells(props.previewX, props.previewY, props.previewSize ?? 1, props.previewOrientation ?? 'horizontal')
  return cells.some((c) => c.x === x && c.y === y)
}

function cellClass(x: number, y: number): string[] {
  const cell = props.board[y]?.[x]
  const classes: string[] = ['cell']

  if (isPreviewCell(x, y)) {
    classes.push(props.previewValid ? 'preview-valid' : 'preview-invalid')
    return classes
  }

  /* c8 ignore next */
  if (!cell) return classes
  if (cell.state === 'ship' && props.showShips) classes.push('ship')
  if (cell.state === 'hit') classes.push('hit')
  if (cell.state === 'miss') classes.push('miss')
  if (props.interactive && cell.state === 'water') classes.push('hoverable')

  return classes
}
</script>

<template>
  <div class="board-wrapper">
    <!-- Kolom labels -->
    <div class="grid-labels-row">
      <div class="corner"></div>
      <div v-for="col in COLS" :key="col" class="label col-label">{{ col }}</div>
    </div>

    <div class="grid-with-row-labels" @mouseleave="emit('boardLeave')">
      <!-- Rij labels + cellen -->
      <template v-for="y in BOARD_SIZE" :key="y">
        <div class="label row-label">{{ y }}</div>
        <div
          v-for="x in BOARD_SIZE"
          :key="`${x}-${y}`"
          :class="cellClass(x - 1, y - 1)"
          @click="interactive && emit('cellClick', x - 1, y - 1)"
          @mousemove="emit('cellHover', x - 1, y - 1)"
        >
          <span v-if="board[y - 1]?.[x - 1]?.state === 'hit'" class="symbol">🔥</span>
          <span v-else-if="board[y - 1]?.[x - 1]?.state === 'miss'" class="symbol">·</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.board-wrapper {
  display: inline-block;
  user-select: none;
}

.grid-labels-row {
  display: grid;
  grid-template-columns: 1.5rem repeat(10, 2.2rem);
  margin-bottom: 2px;
}

.grid-with-row-labels {
  display: grid;
  grid-template-columns: 1.5rem repeat(10, 2.2rem);
  grid-template-rows: repeat(10, 2.2rem);
}

.label {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #888;
  font-weight: 600;
}

.corner { width: 1.5rem; }

.cell {
  border: 1px solid #c0d0e0;
  background: #e8f4f8;
  cursor: default;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.1s;
}

.cell.hoverable:hover {
  background: #b0d8f0;
  cursor: crosshair;
}

.cell.ship {
  background: #4a90d9;
}

.cell.hit {
  background: #e74c3c;
}

.cell.miss {
  background: #bdc3c7;
}

.cell.preview-valid {
  background: rgba(52, 168, 83, 0.5);
  cursor: crosshair;
}

.cell.preview-invalid {
  background: rgba(231, 76, 60, 0.5);
  cursor: not-allowed;
}

.symbol {
  pointer-events: none;
}
</style>
