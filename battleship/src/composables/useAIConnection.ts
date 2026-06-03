import { ref, readonly } from 'vue'
import type { GameMessage } from '../game/types'
import { SHIP_DEFINITIONS } from '../game/types'
import type { GameConnection } from './useGameConnection'
import { createAI, randomBoard } from '../game/ai'
import { fireShot, checkWin } from '../game/logic'

export function createAIConnection(playerGoesFirst: boolean): GameConnection {
  const heartbeatLost = ref(false)
  const secondsSinceLastHeartbeat = ref(0)

  let onMessageCallback: ((msg: GameMessage) => void) | null = null

  // AI bord en schepen (willekeurig geplaatst bij aanmaak)
  const { board: initialBoard, ships: initialShips } = randomBoard()
  let aiBoard = initialBoard
  let aiShips = initialShips

  // AI strategie (bijhoudt wat hij weet van het spelersbord)
  const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))

  function scheduleMessage(msg: GameMessage, delay: number): void {
    setTimeout(() => {
      onMessageCallback?.(msg)
    }, delay)
  }

  function sendMessage(msg: GameMessage): void {
    if (msg.type === 'ready') {
      // AI reageert met ready
      scheduleMessage({ type: 'ready' }, 0)
      // Als AI als eerste schiet, direct na ready een schot plannen
      if (!playerGoesFirst) {
        const shot = ai.nextShot()
        scheduleMessage({ type: 'shot', x: shot.x, y: shot.y }, 500)
      }
    } else if (msg.type === 'shot') {
      // Speler schiet op het AI-bord
      const { hit, sunk, newBoard, newShips } = fireShot(aiBoard, aiShips, msg.x, msg.y)
      aiBoard = newBoard
      aiShips = newShips

      if (checkWin(newShips)) {
        // Speler heeft gewonnen — AI-vloot is volledig gezonken
        scheduleMessage({ type: 'game-over', winner: 'host' }, 100)
      } else {
        scheduleMessage({ type: 'shot-result', x: msg.x, y: msg.y, hit, ...(sunk ? { sunk } : {}) }, 100)
        // Speler heeft gemist → AI is aan de beurt
        if (!hit) {
          const shot = ai.nextShot()
          scheduleMessage({ type: 'shot', x: shot.x, y: shot.y }, 500)
        }
      }
    } else if (msg.type === 'shot-result') {
      // Resultaat van AI's schot op het spelersbord
      ai.processResult(msg.x, msg.y, msg.hit, msg.sunk)
      if (msg.hit) {
        // AI heeft geraakt → AI schiet opnieuw
        const shot = ai.nextShot()
        scheduleMessage({ type: 'shot', x: shot.x, y: shot.y }, 500)
      }
      // Bij mis is de speler aan de beurt — GameView zet myTurn=true via shot-result
    }
    // game-over: negeren — GameView handelt navigatie af
  }

  function onMessage(cb: (msg: GameMessage) => void): void {
    onMessageCallback = cb
  }

  function onDisconnected(_cb: () => void): void {
    // AI verbreekt nooit de verbinding
  }

  function destroy(): void {
    onMessageCallback = null
  }

  return {
    sendMessage,
    onMessage,
    onDisconnected,
    destroy,
    heartbeatLost: readonly(heartbeatLost) as any,
    secondsSinceLastHeartbeat: readonly(secondsSinceLastHeartbeat) as any,
    isAI: true,
  }
}
