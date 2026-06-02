import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GameBoard from '../GameBoard.vue'
import { createBoard, placeShip } from '../../game/logic'
import type { Board, Ship } from '../../game/types'

function makeBoard(): Board {
  return createBoard()
}

function boardWithShip(): { board: Board; ship: Ship } {
  const ship: Ship = { id: 's1', type: 'destroyer', size: 2, orientation: 'horizontal', x: 0, y: 0, hits: 0 }
  const board = placeShip(makeBoard(), ship)
  return { board, ship }
}

describe('GameBoard', () => {
  it('rendert een 10×10 raster van cellen', () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard() } })
    expect(wrapper.findAll('.cell')).toHaveLength(100)
  })

  it('emitteert cell-click bij klik op interactieve cel', async () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard(), interactive: true } })
    await wrapper.findAll('.cell')[0].trigger('click')
    expect(wrapper.emitted('cellClick')).toBeTruthy()
    expect(wrapper.emitted('cellClick')![0]).toEqual([0, 0])
  })

  it('emitteert geen cell-click als interactive false is', async () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard(), interactive: false } })
    await wrapper.findAll('.cell')[0].trigger('click')
    expect(wrapper.emitted('cellClick')).toBeFalsy()
  })

  it('toont schip wanneer showShips true is', () => {
    const { board } = boardWithShip()
    const wrapper = mount(GameBoard, { props: { board, showShips: true } })
    expect(wrapper.find('.cell.ship').exists()).toBe(true)
  })

  it('toont geen schip wanneer showShips false is', () => {
    const { board } = boardWithShip()
    const wrapper = mount(GameBoard, { props: { board, showShips: false } })
    expect(wrapper.find('.cell.ship').exists()).toBe(false)
  })

  it('toont hit-cel', () => {
    const board = makeBoard()
    board[0][0] = { x: 0, y: 0, state: 'hit' }
    const wrapper = mount(GameBoard, { props: { board } })
    expect(wrapper.find('.cell.hit').exists()).toBe(true)
    expect(wrapper.find('.symbol').text()).toContain('🔥')
  })

  it('toont miss-cel', () => {
    const board = makeBoard()
    board[0][0] = { x: 0, y: 0, state: 'miss' }
    const wrapper = mount(GameBoard, { props: { board } })
    expect(wrapper.find('.cell.miss').exists()).toBe(true)
  })

  it('toont hoverable klasse op water-cel bij interactive', () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard(), interactive: true } })
    expect(wrapper.find('.cell.hoverable').exists()).toBe(true)
  })

  it('preview valid: toont preview-valid klasse', () => {
    const wrapper = mount(GameBoard, {
      props: { board: makeBoard(), previewX: 0, previewY: 0, previewSize: 2, previewOrientation: 'horizontal', previewValid: true },
    })
    expect(wrapper.find('.cell.preview-valid').exists()).toBe(true)
  })

  it('preview invalid: toont preview-invalid klasse', () => {
    const wrapper = mount(GameBoard, {
      props: { board: makeBoard(), previewX: 0, previewY: 0, previewSize: 2, previewOrientation: 'horizontal', previewValid: false },
    })
    expect(wrapper.find('.cell.preview-invalid').exists()).toBe(true)
  })

  it('preview zonder previewSize en previewOrientation gebruikt defaults', () => {
    const wrapper = mount(GameBoard, {
      props: { board: makeBoard(), previewX: 0, previewY: 0, previewValid: true },
      // previewSize en previewOrientation weggelaten → defaults ?? 1 en ?? 'horizontal'
    })
    expect(wrapper.find('.cell.preview-valid').exists()).toBe(true)
  })

  it('geen preview wanneer previewX defined maar previewY undefined', () => {
    const wrapper = mount(GameBoard, {
      props: { board: makeBoard(), previewX: 0, previewSize: 2, previewOrientation: 'horizontal', previewValid: true },
    })
    expect(wrapper.find('.cell.preview-valid').exists()).toBe(false)
  })

  it('emitteert cell-hover bij mousemove', async () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard() } })
    await wrapper.findAll('.cell')[0].trigger('mousemove')
    expect(wrapper.emitted('cellHover')).toBeTruthy()
  })

  it('emitteert board-leave bij mouseleave op grid', async () => {
    const wrapper = mount(GameBoard, { props: { board: makeBoard() } })
    await wrapper.find('.grid-with-row-labels').trigger('mouseleave')
    expect(wrapper.emitted('boardLeave')).toBeTruthy()
  })
})
