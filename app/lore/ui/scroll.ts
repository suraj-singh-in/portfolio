/** Word-wrap text to lines of at most `width` characters. */
export function wrapText(text: string, width: number): string[] {
  const out: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (line && (line + ' ' + word).length > width) { out.push(line); line = word }
    else line = line ? line + ' ' + word : word
  }
  if (line) out.push(line)
  return out
}

const pad = (s: string, w: number) => s + ' '.repeat(Math.max(0, w - s.length))

/**
 * An unrolled parchment scroll in ASCII; every returned line has the same length.
 * `body` lines are placed inside, padded to `width`.
 *
 *    ____________
 *   /\           \
 *   \_|            |
 *     |  body      |
 *     |  __________|_
 *      \_/__________/
 */
export function scrollFrame(body: string[], width: number): string[] {
  const W = width
  return [
    ' ' + '_'.repeat(W + 4) + '  ',
    '/\\' + ' '.repeat(W + 3) + '\\ ',
    '\\_|' + ' '.repeat(W + 2) + '| ',
    ...body.map((l) => '  | ' + pad(l, W) + ' | '),
    '  | ' + '_'.repeat(W + 1) + '|_',
    '   \\_/' + '_'.repeat(W) + '/',
  ]
}

/** `[#####.....]` progress bar, `cells` wide inside the brackets. */
export function asciiBar(p: number, cells: number): string {
  const n = Math.round(Math.max(0, Math.min(1, p)) * cells)
  return '[' + '#'.repeat(n) + '.'.repeat(cells - n) + ']'
}

/**
 * A titled box of key → label rows drawn with box-drawing glyphs; every line has the same length.
 * ┌─ controls ──────┐
 * │ W A S D   walk  │
 * └─────────────────┘
 */
export function asciiBox(title: string, rows: [string, string][], keyWidth: number): string[] {
  const inner = Math.max(...rows.map(([, l]) => keyWidth + 1 + l.length), title.length + 3)
  const top = '┌─ ' + title + ' ' + '─'.repeat(inner - title.length - 1) + '┐'
  return [
    top,
    ...rows.map(([k, l]) => '│ ' + pad(pad(k, keyWidth) + ' ' + l, inner) + ' │'),
    '└' + '─'.repeat(inner + 2) + '┘',
  ]
}
