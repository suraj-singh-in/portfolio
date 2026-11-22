"""
Author the rider clips for /lore on the hero's own skeleton and export them
as an animation-only GLB (no mesh, no skin) that the engine merges by bone name.

Run inside Blender (Text Editor or the MCP bridge) on an empty scene:
  1. File > Import glTF  spike-ascii-3d/models/hero_original.glb  (Bone Dir: Temperance)
  2. optional fit reference: import spike-ascii-3d/models/horse.glb the same way
  3. run this script -> writes public/lore/models/hero_ride.glb

Facts this relies on (checked 2026-11-22):
  - Importing with bone_heuristic='TEMPERANCE' and exporting armature-only round-trips
    the original Idle with max quaternion deviation 4e-8.
  - Imported this way, the hero's body faces +Y in Blender (its Root bone rest is flipped 180° relative
    to the GLB) and ".L" bones are on -X; armature scale is 100. The engine therefore drops every Root
    track (see stripRootTracks) and the poses here bend limbs toward +Y = the body's front.
  - The hero's Idle does NOT key every bone, so each pose starts from the rest pose
    (otherwise bones keep whatever the previously evaluated action left behind).
  - Horse Walk = 29 frames, Gallop = 15 frames at 24 fps; rider loops match exactly.
"""
import math
import bpy
from mathutils import Matrix, Quaternion, Vector

OUT = r"C:\Users\Suraj Singh\Desktop\preparation\portfolio\public\lore\models\hero_ride.glb"
# WX is the pitch axis: a positive angle swings a limb toward the body's front (+Y), i.e. forward.
WX, WY = Vector((-1, 0, 0)), Vector((0, 1, 0))

arm = bpy.data.objects["CharacterArmature"]
P = arm.pose.bones
vl = bpy.context.view_layer
sc = bpy.context.scene
idle = next(a for a in bpy.data.actions if a.name.endswith("|Idle") and a.name.startswith("CharacterArmature"))


def rot(name, axis_world, deg):
    """Rotate a pose bone about a world-space axis through its joint."""
    pb = P[name]
    h = pb.head.copy()
    a = (arm.matrix_world.inverted().to_3x3() @ axis_world).normalized()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(deg), 4, a) @ Matrix.Translation(-h) @ pb.matrix
    vl.update()


def seated(lean=8.0, bob=0.0, rock=0.0, legs=1.0, arms=1.0, flex=75, knee=90, spread=28, tuck=24, swingR=0.0):
    """Seated rider pose on top of the current pose. legs/arms blend 0..1; swingR lifts the right leg over."""
    if bob:
        pb = P["Body"]
        m = pb.matrix.copy()
        m.translation += arm.matrix_world.inverted().to_3x3() @ Vector((0, 0, bob))
        pb.matrix = m
        vl.update()
    for s, sg in (("L", 1), ("R", -1)):
        sw = swingR if s == "R" else 0.0
        rot("UpperLeg." + s, WY, (spread + 45 * sw) * sg * legs)
        rot("UpperLeg." + s, WX, -(flex - 35 * sw) * legs)
        rot("LowerLeg." + s, WX, (knee - 40 * sw) * legs)
        rot("LowerLeg." + s, WY, -tuck * sg * legs)
        shin, foot = P["LowerLeg." + s], P["Foot." + s]   # feet are parented to Root (IK style): carry them along
        m = foot.matrix.copy()
        m.translation = shin.tail + arm.matrix_world.inverted().to_3x3() @ Vector((0, 0, -0.076))
        foot.matrix = m
        vl.update()
        rot("Foot." + s, WX, -15 * legs)
        rot("UpperArm." + s, WX, -22 * arms)
        rot("LowerArm." + s, WX, -30 * arms)   # hands low and forward, at rein height
        rot("LowerArm." + s, WY, -20 * sg * arms)
    rot("Abdomen", WX, (lean + rock) * 0.5)
    rot("Chest", WX, (lean + rock) * 0.5)


def capture(params, base_frame=0):
    arm.animation_data.action = idle
    for pb in P:
        pb.location = (0, 0, 0)
        pb.rotation_quaternion = Quaternion()
        pb.scale = (1, 1, 1)
    sc.frame_set(base_frame)
    vl.update()
    seated(**params)
    return {pb.name: (pb.location.copy(), pb.rotation_quaternion.copy(), pb.scale.copy()) for pb in P}


def build():
    for t in arm.animation_data.nla_tracks:
        t.mute = True
    idle_len = int(idle.frame_range[1])
    two_pi = 2 * math.pi
    W, G = 29, 15
    clips = {
        "Ride_Idle": [(f, capture(dict(lean=8 + 2 * math.sin(two_pi * f / 48), bob=0.004 * math.sin(two_pi * f / 48)), f % idle_len))
                      for f in (0, 12, 24, 36, 48)],
        "Ride_Walk": [(f, capture(dict(lean=10, bob=-0.025 * abs(math.sin(two_pi * f / W)), rock=3 * math.sin(two_pi * f / W))))
                      for f in list(range(0, W, 4)) + [W]],
        "Ride_Gallop": [(f, capture(dict(lean=16, bob=0.05 * math.sin(two_pi * f / G), rock=6 * math.sin(two_pi * f / G + 0.8), flex=70, knee=95)))
                        for f in list(range(0, G, 2)) + [G]],
        "Ride_Mount": [
            (0, capture(dict(lean=0, legs=0, arms=0))),
            (8, capture(dict(lean=14, legs=0.35, arms=0.7))),
            (14, capture(dict(lean=20, legs=0.8, arms=1.0, swingR=1.0))),
            (20, capture(dict(lean=12, legs=1.0, arms=1.0, swingR=0.3))),
            (24, capture(dict())),
        ],
    }
    clips["Ride_Dismount"] = [(24 - f, pose) for f, pose in reversed(clips["Ride_Mount"])]

    ad = arm.animation_data
    for t in list(ad.nla_tracks):
        ad.nla_tracks.remove(t)
    for name, keys in clips.items():
        old = bpy.data.actions.get(name)
        if old:
            bpy.data.actions.remove(old)
        act = bpy.data.actions.new(name)
        act.use_fake_user = True
        ad.action = act
        prev = {}
        for f, pose in keys:
            for pb in P:
                loc, q, scl = pose[pb.name]
                q = q.copy()
                if pb.name in prev and prev[pb.name].dot(q) < 0:
                    q.negate()   # keep quaternion signs continuous: no long-way spins between keys
                prev[pb.name] = q
                pb.location, pb.rotation_quaternion, pb.scale = loc, q, scl
                for path in ("location", "rotation_quaternion", "scale"):
                    pb.keyframe_insert(path, frame=f)
        track = ad.nla_tracks.new()
        track.name = name
        track.strips.new(name, 0, act)
    ad.action = None


def export():
    root = arm.parent
    root.location, root.rotation_euler = (0, 0, 0), (0, 0, 0)
    bpy.ops.object.select_all(action="DESELECT")
    for o in (arm, root):
        o.hide_set(False)
        o.select_set(True)
    vl.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", use_selection=True, export_animations=True,
                              export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_skins=False,
                              export_yup=True, export_materials="NONE", export_apply=False)


build()
export()
print("wrote", OUT)
