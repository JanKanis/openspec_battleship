import { describe, it, expect, vi, beforeEach } from 'vitest'
import { randomBoard, createAI } from '../ai'
import { SHIP_DEFINITIONS } from '../types'
import { BOARD_SIZE } from '../logic'

describe('randomBoard', () => {
  it('plaatst alle vijf schepen op het bord', () => {
    const { ships } = randomBoard()
    expect(ships).toHaveLength(5)
    expect(ships.map((s) => s.type).sort()).toEqual(
      SHIP_DEFINITIONS.map((d) => d.type).sort(),
    )
  })

  it('geen overlappende schepen', () => {
    const { board } = randomBoard()
    const shipCells = new Map<string, string>()
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const cell = board[y][x]
        if (cell.shipId) {
          const key = `${x},${y}`
          expect(shipCells.has(key)).toBe(false)
          shipCells.set(key, cell.shipId)
        }
      }
    }
  })

  it('alle schepen liggen binnen het bord', () => {
    const { ships } = randomBoard()
    for (const ship of ships) {
      if (ship.orientation === 'horizontal') {
        expect(ship.x + ship.size - 1).toBeLessThan(BOARD_SIZE)
      } else {
        expect(ship.y + ship.size - 1).toBeLessThan(BOARD_SIZE)
      }
    }
  })
})

describe('createAI — Hunt modus', () => {
  it('nextShot retourneert een cel die nog niet geschoten is', () => {
    const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))
    const shot = ai.nextShot()
    expect(shot.x).toBeGreaterThanOrEqual(0)
    expect(shot.x).toBeLessThan(BOARD_SIZE)
    expect(shot.y).toBeGreaterThanOrEqual(0)
    expect(shot.y).toBeLessThan(BOARD_SIZE)
  })

  it('nextShot kiest hoge-kans cel op leeg bord (midden heeft hogere kans)', () => {
    const ai = createAI(['carrier']) // groot schip = meer overlap in midden
    const shot = ai.nextShot()
    // Midden van bord heeft hogere statistische kans
    expect(shot.x).toBeGreaterThan(0)
    expect(shot.x).toBeLessThan(BOARD_SIZE - 1)
  })

  it('schiet nooit twee keer op dezelfde cel', () => {
    const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))
    const shots = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const shot = ai.nextShot()
      const key = `${shot.x},${shot.y}`
      expect(shots.has(key)).toBe(false)
      shots.add(key)
      ai.processResult(shot.x, shot.y, false)
    }
  })
})

describe('createAI — Target modus na raak', () => {
  it('schakelt naar target modus na een raak', () => {
    const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))
    const firstShot = ai.nextShot()
    ai.processResult(firstShot.x, firstShot.y, true) // raak maar niet gezonken
    // Volgende schot moet een buurcel zijn
    const nextShot = ai.nextShot()
    const dx = Math.abs(nextShot.x - firstShot.x)
    const dy = Math.abs(nextShot.y - firstShot.y)
    expect(dx + dy).toBe(1) // moet aangrenzend zijn
  })

  it('keert terug naar hunt modus na zinken', () => {
    const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))
    const firstShot = ai.nextShot()
    ai.processResult(firstShot.x, firstShot.y, true, 'destroyer') // raak + gezonken
    // Na zinken: volgende schot hoeft geen buurcel te zijn (hunt modus)
    const nextShot = ai.nextShot()
    expect(nextShot).toBeDefined()
  })

  it('schiet nooit op een al geschoten cel in target modus', () => {
    const ai = createAI(SHIP_DEFINITIONS.map((d) => d.type))
    // Schiet op (5,5) — raak
    ai.processResult(5, 5, false) // mis eerst zodat (5,5) in shotCells staat
    // Simuleer: raak op (4,5)
    ai.processResult(4, 5, true) // raak → buurcellen worden (3,5), (5,5), (4,4), (4,6)
    // (5,5) staat al in shotCells, dus nextShot mag dat niet kiezen
    const shot = ai.nextShot()
    expect(`${shot.x},${shot.y}`).not.toBe('5,5')
    expect(`${shot.x},${shot.y}`).not.toBe('4,5')
  })

  it('valt terug naar hunt als targetQueue leeg is', () => {
    const ai = createAI(['destroyer'])
    // Raak op hoekcel (0,0) — maar buurcellen worden al snel uitgeput
    ai.processResult(0, 0, true) // target modus
    // Schiet alle buurcellen weg als misses
    ai.processResult(1, 0, false)
    ai.processResult(0, 1, false)
    // Queue leeg — nextShot moet nog steeds een geldige cel teruggeven
    const shot = ai.nextShot()
    expect(shot).toBeDefined()
    expect(['0,0', '1,0', '0,1']).not.toContain(`${shot.x},${shot.y}`)
  })
})

describe('createAI — processResult', () => {
  it('verwijdert gezonken schip uit remainingShips', () => {
    // Test indirect: na zinken van carrier (size 5) telt de kanskaart anders
    const ai = createAI(['carrier', 'destroyer'])
    ai.processResult(0, 0, true, 'carrier')
    // Nu alleen destroyer over — volgende schot moet valid zijn
    const shot = ai.nextShot()
    expect(shot).toBeDefined()
  })
})
