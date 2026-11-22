/**
 * Every tunable for /lore lives here. Values come from the tuned prototype
 * (side-quest/text-draw/spike-ascii-3d) and the approved design spec.
 */
export const CONFIG = {
  SEED: 20261121,
  PLAYER_NAME: 'kafka',
  GRASS_COUNT: 6_000_000,
  ZOOM: { min: 0.8, max: 1.7, default: 0.9 },
  /** Hero symbol grid (columns × rows); fixed regardless of screen or zoom. */
  HERO_GRID: [199, 133] as const,
  SCENERY_SYMBOL_SCALE: 0.5,
  /** Symbol cell size multiplier for the horse (finer = smaller). */
  HORSE_SYMBOL_SCALE: 0.35,
  WIND: { dir: [1, 0.35] as const, strength: 1 },
  CLEARING: {
    radius: 13,
    stretchX: 1.15,
    /** [frequency, phase, amplitude] sine terms that make the edge irregular */
    wobble: [[3, 1.3, 0.14], [5, 0.4, 0.08], [8, 2.1, 0.05]] as const,
  },
  PLAYER: { walk: 2.0, run: 4.6, radius: 0.35, start: { x: 0.5, z: 4 }, strokeSecs: 2.6 },
  HORSE: { alert: 5, calm: 6.5, interact: 2.8, strokeSecs: 3.2, lookClamp: 0.9, grazeSwitch: [6, 12] as const },
  CAMERA: { offset: [0, 9, 8.2] as const, followRate: 2.5, zoomRate: 8 },
  AUDIO: {
    ambience: 0.5, step: 0.45, stepPool: 4, walkInterval: 0.48, runInterval: 0.3,
    /** horse: snort after a stroke; hoofbeats reuse the step sound, lower and heavier, at its gait cadence */
    snort: 0.7, snortDelay: 0.45, hoof: 0.6, hoofWalkInterval: 0.3, hoofGallopInterval: 0.16, hoofRate: 0.78,
  },
  TRAMPLE: { recoverPerSec: 0.085 },
  /** mounted horse: speeds m/s, accel m/s², turn rad/s, collision radius m, mount/dismount s, side offset m */
  /** walking to the horse's side before mounting: give up after this many seconds; turn rate rad/s */
  APPROACH: { maxSecs: 3, turnRate: 7 },
  RIDE: { walk: 2.6, gallop: 6, accel: 6, turnRate: 3, radius: 1.1, mountSecs: 1.0, dismountSecs: 1.0, sideOffset: 1.2 },
  /** ground speed (m/s) at which the horse's Walk / Gallop clips play at 1× — feet stay planted */
  RIDE_CLIP_SPEED: { walk: 2.6, gallop: 6 },
  /** saddle point relative to the horse's Torso2 bone (horse space, metres; measured in Blender) */
  SADDLE: [0, 0.374, -0.089] as const,
  DISMOUNT_CAPTION: 'You slide down. It stays close.',
  MAX_DPR: 2,
  LORE_LOADING_TEXT: 'Before the paths had names, a fire was kept burning at the edge of the forest.',
  /** shown when you stroke the horse (E), in turn */
  CAPTIONS: [
    'You run a hand down its neck. It leans into you.',
    'It snorts softly. Warm breath, cold night.',
    'It nudges your shoulder, then goes back to the grass.',
  ],
  MOUNT_CAPTION: 'You swing up onto its back.',
  /** Linear RGB tunic colours for the hero's red shirt (body mesh only). */
  HERO_SHIRT: { Green: [0.42, 0.05, 0.04], LightGreen: [0.55, 0.1, 0.07] } as Record<string, [number, number, number]>,
  /** Soft medieval palette (linear RGB) applied to the hero by material name. */
  PALETTE: {
    Green: [0.17, 0.2, 0.12], LightGreen: [0.34, 0.32, 0.2], Brown2: [0.22, 0.14, 0.08], Brown: [0.33, 0.22, 0.11],
    Black: [0.07, 0.05, 0.04], Grey: [0.14, 0.12, 0.1], Gold: [0.36, 0.27, 0.1],
  } as Record<string, [number, number, number]>,
} as const
