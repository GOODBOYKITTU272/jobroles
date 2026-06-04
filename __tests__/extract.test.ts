import { describe, it, expect } from 'vitest'
import { smartTruncate } from '../lib/pipeline/extract'

describe('smartTruncate', () => {
  it('returns text unchanged when under limit', () => {
    const text = 'short text'
    expect(smartTruncate(text, 8000)).toBe(text)
  })

  it('truncates to maxChars when over limit', () => {
    const text = 'x'.repeat(100000)
    const result = smartTruncate(text, 1000)
    expect(result.length).toBeLessThanOrEqual(4000)
  })

  it('prefers section content when available', () => {
    const text = 'unrelated preamble\n'.repeat(100) +
      'SKILLS: JavaScript, React\n' + 'y'.repeat(1000)
    const result = smartTruncate(text, 100)
    expect(result).toContain('SKILLS')
  })

  it('falls back to raw slice when no sections found', () => {
    const text = 'a'.repeat(50000)
    const result = smartTruncate(text, 1000)
    expect(result.length).toBeLessThanOrEqual(4000)
    expect(result).toBe('a'.repeat(4000))
  })
})