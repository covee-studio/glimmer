import { expect, it } from 'vitest'
import { solarLightAt } from '../src/components/zen/solarLight'

const channels = (colors: string[]) => colors.flatMap(color => [1, 3, 5].map(offset => parseInt(color.slice(offset, offset + 2), 16)))
it('distinguishes dawn, noon, afternoon and evening on the local clock', () => {
  const hours = [5, 12, 15, 21]
  expect(hours.map(hour => solarLightAt(hour).name)).toEqual(['dawn', 'noon', 'afternoon', 'evening'])
  expect(new Set(hours.map(hour => solarLightAt(hour).sky.join()))).toHaveProperty('size', 4)
})
it('keeps light continuous across every phase boundary, including midnight', () => {
  for (const hour of [0, 5, 8, 12, 15, 18, 21, 24]) {
    const before = channels(solarLightAt(hour - 1 / 3600).sky)
    const after = channels(solarLightAt(hour + 1 / 3600).sky)
    expect(Math.max(...before.map((value, i) => Math.abs(value - after[i])))).toBeLessThanOrEqual(1)
  }
})
it('changes gradually within a phase instead of holding a fixed band of color', () => {
  expect(solarLightAt(9).sky).not.toEqual(solarLightAt(10).sky)
  expect(solarLightAt(0).sky).toEqual(solarLightAt(24).sky)
})
