import { groupByDate, monthGrid, shiftMonth } from './calendar'

describe('monthGrid', () => {
  it('starts on a Sunday and covers whole weeks', () => {
    const cells = monthGrid(2026, 11) // Nov 1 2026 is a Sunday
    expect(cells.length % 7).toBe(0)
    expect(cells[0]).toEqual({ iso: '2026-11-01', day: 1, inMonth: true })
  })

  it('pads with days from neighbouring months', () => {
    const cells = monthGrid(2026, 9) // Sep 1 2026 is a Tuesday
    expect(cells[0]).toMatchObject({ iso: '2026-08-30', inMonth: false })
    expect(cells.filter((c) => c.inMonth)).toHaveLength(30)
  })
})

describe('shiftMonth', () => {
  it('wraps across years', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 })
  })
})

describe('groupByDate', () => {
  it('groups pickups that share a day', () => {
    const map = groupByDate([
      { date: '2026-11-02', type: 'garbage', window: '7AM-12PM', shifted_from: null },
      { date: '2026-11-02', type: 'food_scraps', window: '7AM-12PM', shifted_from: null },
      { date: '2026-11-09', type: 'recycling', window: '12PM-6PM', shifted_from: null },
    ])
    expect(map.get('2026-11-02')).toHaveLength(2)
    expect(map.size).toBe(2)
  })
})
