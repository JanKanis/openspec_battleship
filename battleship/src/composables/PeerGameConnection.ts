import { usePeerConnection } from './usePeerConnection'
import type { GameConnection } from './useGameConnection'

export function createPeerGameConnection(): GameConnection {
  const peer = usePeerConnection()
  return {
    sendMessage: (msg) => peer.sendMessage(msg),
    onMessage: (cb) => peer.onMessage(cb),
    onDisconnected: (cb) => peer.onDisconnected(cb),
    destroy: () => peer.destroy(),
    get heartbeatLost() { return peer.heartbeatLost as any },
    get secondsSinceLastHeartbeat() { return peer.secondsSinceLastHeartbeat as any },
    isAI: false,
  }
}
