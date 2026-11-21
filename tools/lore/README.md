# /lore asset pipeline

Source assets live outside this repo in `side-quest/text-draw/spike-ascii-3d/` (the `.blend` is ~1.8 GB with library caches). Only compressed outputs are committed under `public/lore/`.

## Scenery sprites
1. Open `spike-ascii-3d/blender/lore_assets.blend` in Blender 5.
2. Run `tools/lore/bake_sprites.py` (Scripting tab). It renders every scenery asset from the game camera into `spike-ascii-3d/sprites/*.png` + `manifest.json` (100 px per metre, transparent).
3. Convert to WebP and write the runtime manifest:
   `node tools/lore/convert-sprites.mjs "<path>/spike-ascii-3d/sprites" public/lore/sprites`
   (uses `sharp`, which ships with Next.js).

## Models
`npx @gltf-transform/cli@4 meshopt <in.glb> public/lore/models/<name>.glb`
- hero ← `spike-ascii-3d/models/hero_original.glb` (Quaternius "Adventurer", original Poly Pizza file; recoloured in code — the Blender re-export broke skinning)
- horse ← `spike-ascii-3d/models/horse.glb` (Quaternius "Horse", exported from Blender with only the needed clips)

## Audio
`public/lore/audio/ambience.mp3` ← https://sfxmint.com/dl/ambience-forest-55.mp3
`public/lore/audio/step.mp3` ← https://sfxmint.com/dl/footsteps-single-01.mp3
sfxmint: free to use, no attribution required (confirmed by Suraj).

## Licences / sources
- Quaternius (via poly.pizza): Adventurer, Horse — CC0.
- Poly Haven (CC0): pine_tree_01, fir_tree_01 (Rico Cilliers, Rob Tuytel); tree_small_02 (Rico Cilliers); island_tree_01 (Rico Cilliers, Rob Tuytel); fern_02 (Rico Cilliers, Rob Tuytel); shrub_02 (Rico Cilliers); rock_moss_set_01, rock_moss_set_02 (Kless Gyzen); tree_stump_01 (Rob Tuytel); dead_tree_trunk_02 (Jenelle van Heerden, Rico Cilliers); stone_fire_pit (Sebastian Platen); dry_branches_medium_01 (Rico Cilliers); wooden_axe (Ulan Cabanilla).
- Hut: modelled in Blender for this project.
