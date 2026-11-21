import { hatch, mulberry32, sketchRect, wobbleLine } from "../lib/pencil"

export const VIEW = { w: 1600, h: 1100 }
// Colours come from CSS variables on `.lib-root` (see page.tsx) so they follow the site's light/dark theme.
export const INK = "currentColor"
export const PAPER = "var(--lib-paper)"

const CAB_W = 470
const CAB_X0 = 95
const CAB_Y = 140
const CAB_H = 860
const FRAME = 20
const BOARD = 12
const ROWS = 6
const SLOT_H = (CAB_H - FRAME * 2 + BOARD) / ROWS

export type Rect = { x: number; y: number; w: number; h: number }

/** Interior of each shelf slot, index = cabinet * 6 + row. `y + h` is the top of the board books stand on. */
export const SHELF_RECTS: Rect[] = Array.from({ length: 18 }, (_, i) => {
  const cabinet = Math.floor(i / ROWS)
  const row = i % ROWS
  const x = CAB_X0 + cabinet * CAB_W + FRAME
  const top = CAB_Y + FRAME + row * SLOT_H
  return { x, y: top, w: CAB_W - FRAME * 2, h: SLOT_H - BOARD }
})

export const CABINET_BOUNDS: Rect = {
  x: CAB_X0,
  y: CAB_Y,
  w: CAB_W * 3,
  h: CAB_H,
}

function buildPaths() {
  const frame: string[] = []
  const boards: string[] = []
  const shading: string[] = []
  const details: string[] = []

  for (let c = 0; c < 3; c++) {
    const rand = mulberry32(101 + c * 17)
    const x = CAB_X0 + c * CAB_W
    // outer carcass
    frame.push(sketchRect(x, CAB_Y, CAB_W, CAB_H, rand, 1.8, 2))
    // inner wall lines (thickness of the side panels)
    frame.push(wobbleLine(x + FRAME, CAB_Y + FRAME, x + FRAME, CAB_Y + CAB_H - FRAME, rand, 1.2))
    frame.push(
      wobbleLine(x + CAB_W - FRAME, CAB_Y + FRAME, x + CAB_W - FRAME, CAB_Y + CAB_H - FRAME, rand, 1.2),
    )
    // side panel hatching = wood grain
    shading.push(hatch(x + 3, CAB_Y + 3, FRAME - 6, CAB_H - 6, 14, rand))
    shading.push(hatch(x + CAB_W - FRAME + 3, CAB_Y + 3, FRAME - 6, CAB_H - 6, 14, rand))
    // shelf boards
    for (let r = 0; r < ROWS; r++) {
      const by = CAB_Y + FRAME + (r + 1) * SLOT_H - BOARD
      if (r < ROWS - 1) {
        boards.push(sketchRect(x + FRAME, by, CAB_W - FRAME * 2, BOARD, rand, 1.1, 2))
        shading.push(hatch(x + FRAME + 2, by + 1, CAB_W - FRAME * 2 - 4, BOARD - 2, 9, rand))
      }
    }
    // feet
    frame.push(sketchRect(x + 14, CAB_Y + CAB_H, 30, 14, rand, 1, 1))
    frame.push(sketchRect(x + CAB_W - 44, CAB_Y + CAB_H, 30, 14, rand, 1, 1))
  }

  // floor line and baseboard
  const rf = mulberry32(555)
  details.push(wobbleLine(30, CAB_Y + CAB_H + 14, VIEW.w - 30, CAB_Y + CAB_H + 14, rf, 2.2, 6))
  details.push(wobbleLine(30, CAB_Y + CAB_H + 26, VIEW.w - 60, CAB_Y + CAB_H + 26, rf, 2.2, 6))
  // framed picture on cabinet 3 (as in the real photo)
  details.push(sketchRect(CAB_X0 + CAB_W * 2 + 300, CAB_Y - 92, 90, 92, rf, 1.4, 2))
  details.push(sketchRect(CAB_X0 + CAB_W * 2 + 312, CAB_Y - 80, 66, 68, rf, 1, 1))
  details.push(hatch(CAB_X0 + CAB_W * 2 + 314, CAB_Y - 78, 62, 64, 7, rf))

  return {
    frame: frame.join(" "),
    boards: boards.join(" "),
    shading: shading.join(" "),
    details: details.join(" "),
  }
}

const PATHS = buildPaths()

export default function Cabinets() {
  const stroke = { fill: "none", stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  return (
    <g filter="url(#pencil-wobble)" aria-hidden="true">
      <path className="draw" pathLength={1} d={PATHS.details} {...stroke} strokeWidth={1.6} opacity={0.75} />
      <path className="draw" pathLength={1} d={PATHS.shading} {...stroke} strokeWidth={0.9} opacity={0.35} />
      <path className="draw" pathLength={1} d={PATHS.boards} {...stroke} strokeWidth={1.7} />
      <path className="draw" pathLength={1} d={PATHS.frame} {...stroke} strokeWidth={2.4} />
    </g>
  )
}
