"""Bake scenery sprites for /lore from lore_assets.blend.

Run inside Blender (Scripting tab, or via the MCP execute tool) with lore_assets.blend open.
Renders each scenery asset from the game camera (orthographic, ~42 deg down, camera offset
three.js (0, 9, 8.2) -> blender (0, -8.2, 9)) into a transparent PNG, 100 px per metre, and
writes sprites/manifest.json with size, anchor (pixel of the world origin) and footprint.

Requires collections RENDER_RIG (GlyphCam + GlyphSun) and RENDER_TMP, set up by setup_rig().
"""
import bpy, math, json, os
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

OUT = os.path.join(os.path.dirname(bpy.data.filepath), "..", "sprites")
PPU = 100


def setup_rig():
    sc = bpy.context.scene
    rig = bpy.data.collections.get("RENDER_RIG") or bpy.data.collections.new("RENDER_RIG")
    if rig.name not in sc.collection.children: sc.collection.children.link(rig)
    for o in list(rig.objects): bpy.data.objects.remove(o, do_unlink=True)
    back = Vector((0, -8.2, 9)).normalized()
    cam = bpy.data.objects.new("GlyphCam", bpy.data.cameras.new("GlyphCam")); rig.objects.link(cam)
    cam.data.type = 'ORTHO'; cam.data.clip_start = 0.1; cam.data.clip_end = 500
    cam.rotation_euler = back.to_track_quat('Z', 'Y').to_euler()
    sun = bpy.data.objects.new("GlyphSun", bpy.data.lights.new("GlyphSun", "SUN")); rig.objects.link(sun)
    sun.data.energy = 3.6; sun.data.angle = math.radians(8)
    sun.rotation_euler = Vector((-5, -5, 9)).normalized().to_track_quat('Z', 'Y').to_euler()
    sc.camera = cam
    w = sc.world or bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes.get("Background"); bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = 0.55
    sc.render.engine = 'BLENDER_EEVEE'
    try: sc.eevee.taa_render_samples = 32
    except Exception: pass
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
    sc.render.resolution_percentage = 100
    tmp = bpy.data.collections.get("RENDER_TMP") or bpy.data.collections.new("RENDER_TMP")
    if tmp.name not in sc.collection.children: sc.collection.children.link(tmp)


def render_asset(name, objs, scale=1.0, yaw=0.0, margin=0.06):
    sc = bpy.context.scene; vl = bpy.context.view_layer
    tmp = bpy.data.collections["RENDER_TMP"]

    def walk(lc):
        yield lc
        for c in lc.children: yield from walk(c)
    for lc in walk(vl.layer_collection):
        if lc.name == "Scene Collection": continue
        lc.exclude = lc.name not in ("RENDER_TMP", "RENDER_RIG")
    for o in list(tmp.objects): tmp.objects.unlink(o)
    saved = []
    for o in objs:
        saved.append((o, o.matrix_world.copy())); tmp.objects.link(o)
    pivot = objs[0].matrix_world.translation.copy()
    R = Matrix.Rotation(yaw, 4, 'Z'); S = Matrix.Scale(scale, 4)
    for o, mw in saved:
        if o.parent and o.parent in objs: continue
        o.matrix_world = R @ S @ (Matrix.Translation(-pivot) @ mw)
    vl.update()
    cam = sc.camera; q = cam.matrix_world.to_quaternion()
    right = q @ Vector((1, 0, 0)); up = q @ Vector((0, 1, 0)); back = q @ Vector((0, 0, 1))
    pts = [o.matrix_world @ Vector(c) for o in objs if o.type == 'MESH' for c in o.bound_box]
    xs = [p.dot(right) for p in pts]; ys = [p.dot(up) for p in pts]
    w = (max(xs) - min(xs)) * (1 + margin * 2); h = (max(ys) - min(ys)) * (1 + margin * 2)
    center = right * (max(xs) + min(xs)) / 2 + up * (max(ys) + min(ys)) / 2
    cam.location = center + back * 120
    cam.data.ortho_scale = max(w, h)
    sc.render.resolution_x = max(8, round(w * PPU)); sc.render.resolution_y = max(8, round(h * PPU))
    vl.update()
    a = world_to_camera_view(sc, cam, Vector((0, 0, 0)))
    anchor = [round(a.x * sc.render.resolution_x, 1), round((1 - a.y) * sc.render.resolution_y, 1)]
    gx = [p.x for p in pts]; gy = [p.y for p in pts]
    foot = round(max(max(gx) - min(gx), max(gy) - min(gy)) / 2, 2)
    os.makedirs(OUT, exist_ok=True)
    sc.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    for o, mw in saved:
        o.matrix_world = mw; tmp.objects.unlink(o)
    meta = {"file": name + ".png", "w": sc.render.resolution_x, "h": sc.render.resolution_y, "ppu": PPU, "anchor": anchor, "foot": foot}
    mf = os.path.join(OUT, "manifest.json")
    m = json.load(open(mf)) if os.path.exists(mf) else {}
    m[name] = meta; json.dump(m, open(mf, "w"), indent=1)
    return meta


def bake_all():
    O = bpy.data.objects
    # fire pit: crossed branches teepee'd inside the stone ring
    for nm, ang, tilt in (("dry_branches_medium_01_a", 0.3, 0.35), ("dry_branches_medium_01_b", 2.4, 0.4), ("dry_branches_medium_01_c", 4.4, 0.45)):
        b = O[nm]; b.location = (0.18 * math.cos(ang), 0.18 * math.sin(ang), 0.12); b.rotation_euler = (tilt, 0, ang + math.pi / 2); b.scale = (0.75, 0.75, 0.75)
    render_asset("firepit", [O["stone_fire_pit"], O["dry_branches_medium_01_a"], O["dry_branches_medium_01_b"], O["dry_branches_medium_01_c"]], scale=1.1)
    render_asset("hut", list(bpy.data.collections["HUT"].objects), scale=1.0, yaw=math.radians(70))
    render_asset("stump", [O["tree_stump_01"]], scale=0.8)
    render_asset("log", [O["dead_tree_trunk_02_LOD0"]], scale=0.7, yaw=0.5)
    render_asset("pine_a", [O["pine_tree_01_a_LOD0"]], scale=0.42)
    render_asset("pine_b", [O["pine_tree_01_b_LOD0"]], scale=0.45, yaw=1.3)
    render_asset("pine_c", [O["pine_tree_01_c_LOD0"]], scale=0.4, yaw=2.5)
    render_asset("fir_a", [O["fir_tree_01_a_LOD0"]], scale=0.42)
    render_asset("fir_b", [O["fir_tree_01_b_LOD0"]], scale=0.48, yaw=1.0)
    render_asset("fir_c", [O["fir_tree_01_c_LOD0"]], scale=0.46, yaw=2.2)
    render_asset("oak", [O["tree_small_02_LOD0"]], scale=1.3)
    render_asset("oak_b", [O["tree_small_02_LOD0"]], scale=1.15, yaw=2.0)
    render_asset("gnarled", [O["island_tree_01_LOD0"]], scale=1.05, yaw=0.6)
    for i, n in enumerate("abcd"):
        render_asset("shrub_" + n, [O[f"shrub_02_{n}_LOD0"]], scale=1.0, yaw=i)
        render_asset("fern_" + n, [O[f"fern_02_{n}"]], scale=1.2, yaw=i * 1.3)
    for i, n in enumerate(["01", "02", "03", "04", "05", "06"]):
        render_asset("rock_" + n, [O[f"rock_moss_set_01_rock{n}"]], scale=0.42, yaw=i)
    for i, n in enumerate(["07", "09", "10", "11", "13"]):
        render_asset("rock_" + n, [O[f"rock_moss_set_02_rock{n}"]], scale=0.5, yaw=i)


if __name__ == "__main__":
    setup_rig()
    bake_all()
