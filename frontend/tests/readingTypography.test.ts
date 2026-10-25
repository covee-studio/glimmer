import { expect, it } from 'vitest'
import { headlineSize } from '../src/utils/readingTypography'
it('keeps short headlines prominent and gives very long headlines room', () => {
  expect(headlineSize('A quiet moment')).toBe('clamp(30px, 3.2vw, 46px)')
  expect(headlineSize('A long headline '.repeat(24))).toBe('clamp(24px, 2.6vw, 34px)')
})
it('handles CJK width and supplementary characters without counting UTF-16 halves', () => {
  expect(headlineSize('读'.repeat(40))).toBe(headlineSize('𠀀'.repeat(40)))
  expect(headlineSize('读'.repeat(80))).toBe(headlineSize('a'.repeat(160)))
  expect(headlineSize('读'.repeat(40))).not.toBe(headlineSize('a'.repeat(40)))
})
