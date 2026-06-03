import type { Ref } from 'vue'
import type { GameMessage } from '../game/types'

export interface GameConnection {
  sendMessage(msg: GameMessage): void
  onMessage(cb: (msg: GameMessage) => void): void
  onDisconnected(cb: () => void): void
  destroy(): void
  heartbeatLost: Ref<boolean>
  secondsSinceLastHeartbeat: Ref<number>
  isAI: boolean
}

let activeConnection: GameConnection | null = null

export function setGameConnection(conn: GameConnection): void {
  activeConnection = conn
}

export function useGameConnection(): GameConnection {
  if (!activeConnection) throw new Error('Geen actieve GameConnection')
  return activeConnection
}

export function clearGameConnection(): void {
  activeConnection = null
}
