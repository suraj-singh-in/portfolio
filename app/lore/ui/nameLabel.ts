/** Position the hero's name label directly (called every frame; must not go through React state). */
export function applyNameLabel(el: { style: { transform: string; opacity: string } }, n: { x: number; y: number; opacity: number }) {
  el.style.transform = `translate(${Math.round(n.x)}px, ${Math.round(n.y)}px) translate(-50%, -100%)`
  el.style.opacity = String(n.opacity)
}
