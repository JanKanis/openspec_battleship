<script setup lang="ts">
import { useRouter } from 'vue-router'
import { usePeerConnection } from '../composables/usePeerConnection'

const props = defineProps<{
  secondsSinceLastHeartbeat: number
}>()

const router = useRouter()
const peer = usePeerConnection()

function abortGame() {
  peer.destroy()
  router.push('/')
}
</script>

<template>
  <div class="connection-warning">
    <p class="warning-text">
      Geen verbinding — wachten op tegenstander
    </p>
    <p class="seconds">
      {{ props.secondsSinceLastHeartbeat }} seconden geen verbinding
    </p>
    <button class="btn abort" @click="abortGame">Spel afbreken</button>
  </div>
</template>

<style scoped>
.connection-warning {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: #fff3cd;
  border: 2px solid #f0ad4e;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.warning-text {
  font-weight: 600;
  color: #856404;
  margin: 0;
}

.seconds {
  font-size: 0.85rem;
  color: #856404;
  margin: 0;
}

.btn.abort {
  padding: 0.4rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn.abort:hover {
  background: #b02a37;
}
</style>
