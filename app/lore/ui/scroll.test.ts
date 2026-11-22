import { describe, expect, it } from 'vitest'
import { asciiBar, asciiBox, wrapText, scrollFrame } from './scroll'

describe('ascii scroll', () => {
  it('wraps text on word boundaries within the width', () => {
    const lines = wrapText('Before the paths had names, a fire was kept burning at the edge of the forest.', 30)
    expect(lines.every((l) => l.length <= 30)).toBe(true)
    expect(lines.join(' ')).toBe('Before the paths had names, a fire was kept burning at the edge of the forest.')
  })

  it('frames every body line to the same width', () => {
    const f = scrollFrame(['a line', 'another one'], 40)
    const widths = new Set(f.map((l) => l.length))
    expect(widths.size).toBe(1)
    expect(f.some((l) => l.includes('a line'))).toBe(true)
  })

  it('draws a progress bar of fixed width', () => {
    expect(asciiBar(0, 10)).toBe('[..........]')
    expect(asciiBar(0.5, 10)).toBe('[#####.....]')
    expect(asciiBar(1, 10)).toBe('[##########]')
  })

  it('boxes rows with a titled top border, all lines equal width', () => {
    const b = asciiBox('controls', [['W A S D', 'walk'], ['M', 'mute']], 9)
    expect(b[0].startsWith('┌─ controls ')).toBe(true)
    expect(b.at(-1)!.startsWith('└')).toBe(true)
    expect(new Set(b.map((l) => l.length)).size).toBe(1)
    expect(b[1]).toContain('W A S D   walk')
  })
})
