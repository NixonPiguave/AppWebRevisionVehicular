"""Reusable Blender geometry helpers; metres, X across, +Y forward, Z up."""
import math
from pathlib import Path
import bpy
import bmesh
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'vehicle'
WEB = ROOT / 'frontend' / 'public' / 'models'
PARTS = []


def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    PARTS.clear()


def material(name, color, metallic=0, roughness=.4, coat=0, emission=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = next(node for node in mat.node_tree.nodes if node.type == 'BSDF_PRINCIPLED')
    for key, value in {'Base Color': (*color, 1), 'Metallic': metallic,
                       'Roughness': roughness, 'Coat Weight': coat,
                       'Coat Roughness': .16, 'Emission Color': (*color, 1),
                       'Emission Strength': emission}.items():
        shader.inputs[key].default_value = value
    return mat


def finish(obj, name, mat, zone, bevel=0, smooth=False):
    obj.name = name
    obj.data.materials.append(mat)
    obj['zone'], obj['partLabel'] = zone, name
    if smooth:
        for face in obj.data.polygons:
            face.use_smooth = True
    if bevel:
        mod = obj.modifiers.new('Radios de fabricación', 'BEVEL')
        mod.width, mod.segments = bevel, 3
        obj.modifiers.new('Normales de superficie', 'WEIGHTED_NORMAL')
    PARTS.append(obj)
    return obj


def box(name, loc, size, mat, zone, bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, zone, bevel)


def mesh(name, verts, faces, mat, zone, bevel=0, smooth=False):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(data)
    bm.free()
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    return finish(obj, name, mat, zone, bevel, smooth)


def panel(name, verts, mat, zone, thickness=.014):
    obj = mesh(name, verts, [tuple(range(len(verts)))], mat, zone)
    obj.modifiers.new('Espesor de panel', 'SOLIDIFY').thickness = thickness
    return obj


def rod(name, start, end, radius, mat, zone, vertices=24):
    direction = Vector(end) - Vector(start)
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius,
        depth=direction.length, location=(Vector(start) + Vector(end)) / 2)
    obj = bpy.context.object
    obj.rotation_euler = direction.to_track_quat('Z', 'Y').to_euler()
    return finish(obj, name, mat, zone, .002, True)


def line(name, points, radius, mat, zone):
    curve = bpy.data.curves.new(name, 'CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth, curve.bevel_resolution = radius, 2
    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for point, co in zip(spline.points, points):
        point.co = (*co, 1)
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    return finish(bpy.context.object, name, mat, zone, smooth=True)


def torus(name, loc, major, minor, mat, zone, axis='X'):
    rotation = (0, math.pi / 2, 0) if axis == 'X' else (0, 0, 0)
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
        major_segments=64, minor_segments=12, location=loc, rotation=rotation)
    return finish(bpy.context.object, name, mat, zone, smooth=True)


def ellipsoid(name, loc, size, mat, zone):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc)
    obj = bpy.context.object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, zone, smooth=True)


def loft(name, rings, mat, zone, bevel=.02):
    """Closed longitudinal body: (Y, half-width, bottom Z, shoulder Z, crown Z)."""
    # Interpolate longitudinal sections and round their profiles geometrically,
    # rather than relying on smooth normals on a handful of flat polygons.
    def catmull(values, steps, closed=False):
        result=[]
        count=len(values)
        for i in range(count if closed else count-1):
            p0=values[(i-1)%count] if closed else values[max(0,i-1)]
            p1,p2=values[i],values[(i+1)%count]
            p3=values[(i+2)%count] if closed else values[min(count-1,i+2)]
            for step in range(steps):
                t=step/steps
                result.append(tuple(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
                    for a,b,c,d in zip(p0,p1,p2,p3)))
        if not closed:
            result.append(values[-1])
        return result
    rings=catmull(rings,5)
    verts = []
    for y, w, bottom, shoulder, crown in rings:
        span=shoulder-bottom
        profile=[(-.82*w,bottom),(-.96*w,bottom+span*.12),(-w,bottom+span*.55),
            (-.97*w,shoulder),(-.80*w,shoulder+(crown-shoulder)*.76),(-.43*w,crown-.003),
            (0,crown),(.43*w,crown-.003),(.80*w,shoulder+(crown-shoulder)*.76),
            (.97*w,shoulder),(w,bottom+span*.55),(.96*w,bottom+span*.12),(.82*w,bottom),(0,bottom)]
        for x, z in catmull(profile,3,True):
            verts.append((x,y,z))
    n = 42
    faces = [tuple(reversed(range(n))), tuple(range((len(rings)-1)*n,len(rings)*n))]
    for i in range(len(rings)-1):
        for j in range(n):
            faces.append((i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j))
    obj=mesh(name, verts, faces, mat, zone, 0, True)
    obj.data.polygons[0].use_smooth=False
    obj.data.polygons[1].use_smooth=False
    return obj


def export_studio(stem, camera_position, target, scale):
    OUT.mkdir(parents=True, exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)
    # Batch repeated details (tread blocks, bolts, grille bars) by semantic label.
    # The .blend keeps every editable source object; the GLB has fewer draw calls.
    groups={}
    depsgraph=bpy.context.evaluated_depsgraph_get()
    for source in PARTS:
        data=bpy.data.meshes.new_from_object(source.evaluated_get(depsgraph))
        obj=bpy.data.objects.new(source.name,data)
        obj.matrix_world=source.matrix_world.copy()
        obj['zone'],obj['partLabel']=source['zone'],source['partLabel']
        bpy.context.collection.objects.link(obj)
        key=(source['zone'],source['partLabel'],tuple(mat.name for mat in data.materials))
        groups.setdefault(key,[]).append(obj)
    exported=[]
    for objects in groups.values():
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:
            obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1:
            bpy.ops.object.join()
        exported.append(objects[0])
    bpy.ops.object.select_all(action='DESELECT')
    for obj in exported:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(WEB / f'{stem}.glb'), export_format='GLB',
        use_selection=True, export_extras=True, export_apply=False)
    count=len(exported)
    for obj in exported:
        data=obj.data
        bpy.data.objects.remove(obj,do_unlink=True)
        if data.users==0:
            bpy.data.meshes.remove(data)
    floor_mat = material('Estudio · gris perla', (.19,.22,.23), roughness=.65)
    bpy.ops.mesh.primitive_plane_add(size=200)
    bpy.context.object.name = 'ESTUDIO · suelo (no exportar)'
    bpy.context.object.data.materials.append(floor_mat)
    for name, loc, energy, size in [('Principal',(-3,4,6),1400,5),
                                   ('Relleno',(4,2,4),1100,4),('Contorno',(0,-4,5),2000,3)]:
        bpy.ops.object.light_add(type='AREA', location=loc)
        light = bpy.context.object
        light.name = 'ESTUDIO · ' + name
        light.data.energy, light.data.shape, light.data.size = energy, 'RECTANGLE', size
        light.data.size_y = size * .45
        light.rotation_euler = (Vector(target)-light.location).to_track_quat('-Z','Y').to_euler()
    bpy.ops.object.camera_add(location=camera_position)
    camera = bpy.context.object
    camera.rotation_euler = (Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.type, camera.data.ortho_scale = 'ORTHO', scale
    scene = bpy.context.scene
    scene.camera, scene.render.engine = camera, 'CYCLES'
    scene.cycles.samples, scene.cycles.use_denoising = 24, True
    scene.world.color = (.25,.25,.25)
    scene.render.resolution_x, scene.render.resolution_y = 1400, 1000
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(OUT / f'{stem}-preview.png')
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / f'{stem}.blend'))
    bpy.ops.render.render(write_still=True)
    print(f'EXPORTED {stem}: {count} selectable meshes; {(WEB / (stem + ".glb")).stat().st_size} bytes')
