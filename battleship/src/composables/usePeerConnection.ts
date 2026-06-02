import { ref, readonly } from 'vue'
import Peer, { type DataConnection } from 'peerjs'
import type { GameMessage, PlayerRole } from '../game/types'

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error'

const peer = ref<Peer | null>(null)
const connection = ref<DataConnection | null>(null)
const status = ref<ConnectionStatus>('idle')
const myPeerId = ref<string>('')
const errorMessage = ref<string>('')
const role = ref<PlayerRole | null>(null)

let onMessageCallback: ((msg: GameMessage) => void) | null = null
let onConnectedCallback: (() => void) | null = null
let onDisconnectedCallback: (() => void) | null = null

function setupConnectionHandlers(conn: DataConnection) {
  connection.value = conn

  conn.on('open', () => {
    status.value = 'connected'
    onConnectedCallback?.()
  })

  conn.on('data', (data) => {
    onMessageCallback?.(data as GameMessage)
  })

  conn.on('close', () => {
    status.value = 'disconnected'
    onDisconnectedCallback?.()
  })

  conn.on('error', (err) => {
    status.value = 'error'
    errorMessage.value = `Verbindingsfout: ${err.message}`
  })
}

export function usePeerConnection() {
  // Host: maak peer aan en wacht op verbinding
  function initHost(): Promise<string> {
    return new Promise((resolve, reject) => {
      role.value = 'host'
      status.value = 'connecting'
      const p = new Peer()
      peer.value = p

      p.on('open', (id) => {
        myPeerId.value = id
        resolve(id)
      })

      p.on('connection', (conn) => {
        setupConnectionHandlers(conn)
      })

      p.on('error', (err) => {
        status.value = 'error'
        errorMessage.value = `PeerJS fout: ${err.message}`
        reject(err)
      })
    })
  }

  // Guest: verbind met host via peer-ID
  function connectToHost(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      role.value = 'guest'
      status.value = 'connecting'
      const p = new Peer()
      peer.value = p

      p.on('open', () => {
        const conn = p.connect(hostId, { reliable: true })
        setupConnectionHandlers(conn)

        conn.on('open', () => resolve())
        conn.on('error', (err: Error) => reject(err))
      })

      p.on('error', (err) => {
        status.value = 'error'
        errorMessage.value = `Kan niet verbinden: controleer de game-code`
        reject(err)
      })
    })
  }

  function sendMessage(msg: GameMessage) {
    connection.value?.send(msg)
  }

  function onMessage(cb: (msg: GameMessage) => void) {
    onMessageCallback = cb
  }

  function onConnected(cb: () => void) {
    onConnectedCallback = cb
    // Als al verbonden, direct aanroepen
    if (status.value === 'connected') cb()
  }

  function onDisconnected(cb: () => void) {
    onDisconnectedCallback = cb
  }

  function destroy() {
    connection.value?.close()
    peer.value?.destroy()
    peer.value = null
    connection.value = null
    status.value = 'idle'
    myPeerId.value = ''
    errorMessage.value = ''
    role.value = null
    onMessageCallback = null
    onConnectedCallback = null
    onDisconnectedCallback = null
  }

  return {
    status: readonly(status),
    myPeerId: readonly(myPeerId),
    errorMessage: readonly(errorMessage),
    role: readonly(role),
    initHost,
    connectToHost,
    sendMessage,
    onMessage,
    onConnected,
    onDisconnected,
    destroy,
  }
}
