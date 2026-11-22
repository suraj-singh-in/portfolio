// Convert baked PNG sprites to WebP and write the runtime manifest.
// Usage: node tools/lore/convert-sprites.mjs <prototype sprites dir> <out dir>
import sharp from 'sharp'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
const [src, out] = process.argv.slice(2)
await mkdir(out, { recursive: true })
const manifest = JSON.parse(await readFile(join(src, 'manifest.json'), 'utf8'))
delete manifest.stump
delete manifest.test_firepit
let total = 0
for (const [name, meta] of Object.entries(manifest)) {
  const file = name + '.webp'
  // big backdrops (mountain ranges) become coarse symbols anyway: cap the image and keep its scale honest
  const MAX = 2048, k = Math.min(1, MAX / Math.max(meta.w, meta.h))
  let img = sharp(join(src, meta.file))
  if (k < 1) {
    const w = Math.round(meta.w * k), h = Math.round(meta.h * k)
    img = img.resize(w, h)
    Object.assign(meta, { w, h, ppu: meta.ppu * k, anchor: [meta.anchor[0] * k, meta.anchor[1] * k] })
  }
  await img.webp({ quality: 85, alphaQuality: 90, effort: 6 }).toFile(join(out, file))
  total += (await stat(join(out, file))).size
  meta.file = file
}
await writeFile(join(out, 'manifest.json'), JSON.stringify(manifest, null, 1))
console.log(Object.keys(manifest).length, 'sprites,', Math.round(total / 1024), 'KB')
