"""Blender --background --python assets/vehicle/create_vehicle.py [-- car|moto]."""
import math
import sys
from pathlib import Path
import bpy

sys.path.insert(0, str(Path(__file__).resolve().parent))
from modeling import (reset, material, box, mesh, panel, rod, line, torus,
                      ellipsoid, loft, export_studio, PARTS)


def side_point(body, side, y, z, offset=.003):
    """Project a shut-line or handle onto the real curved body, never a floating slab."""
    evaluated=body.evaluated_get(bpy.context.evaluated_depsgraph_get())
    hit,point,normal,index=evaluated.ray_cast((side*3,y,z),(-side,0,0))
    return (point.x+side*offset,y,z) if hit else (side*.93,y,z)


def partition_body(body,p):
    """Keep curved bodywork continuous but export recognisable selectable panels."""
    groups={}
    for face in body.data.polygons:
        x,y,z=face.center
        side='izquierdo' if x<0 else 'derecho'
        zone='lateralIzquierdo' if x<0 else 'lateralDerecho'
        if abs(x)>.62:
            if -.16<y<.95 and z>.56:
                name='Puerta delantera · lado '+side
            elif -1.19<y<=-.16 and z>.56:
                name='Puerta trasera · lado '+side
            else:
                name=('Guardabarros delantero ' if y>0 else 'Aleta trasera ')+side
        elif y>.85:
            name,zone='Parachoques delantero','delantera'
        elif y<-1.3:
            name,zone='Portón trasero','trasera'
        else:
            name,zone='Estructura de habitáculo','habitaculo'
        groups.setdefault((name,zone),[]).append(face)
    for (name,zone),faces in groups.items():
        index_map={}
        verts=[]
        polygons=[]
        for face in faces:
            indices=[]
            for index in face.vertices:
                if index not in index_map:
                    index_map[index]=len(verts)
                    verts.append(tuple(body.data.vertices[index].co))
                indices.append(index_map[index])
            polygons.append(tuple(indices))
        # Preserve original surface normals across the separate panel boundaries.
        obj=mesh(name,verts,polygons,p['paint'],zone,smooth=True)
        normals=[tuple(body.data.vertices[original].normal) for original in index_map]
        obj.data.normals_split_custom_set_from_vertices(normals)
    PARTS.remove(body)
    bpy.data.objects.remove(body,do_unlink=True)


def palette(moto=False):
    return {
        'paint': material('Laca metálica · negro ónix' if moto else 'Laca metálica · rojo granate',
            (.013,.019,.028) if moto else (.42,.008,.022), .72, .21, .9),
        'accent': material('Acento rojo deportivo', (.55,.005,.016), .55, .25, .6),
        'glass': material('Cristal ahumado', (.016,.032,.042), .25, .10, .7),
        'rubber': material('Caucho satinado', (.012,.015,.018), 0, .78),
        'trim': material('Grafito', (.028,.034,.042), .35, .35),
        'alloy': material('Aluminio mecanizado', (.57,.63,.68), .92, .22),
        'chrome': material('Cromo pulido', (.8,.85,.9), 1, .13),
        'gold': material('Horquilla anodizada', (.48,.29,.07), .82, .25),
        'lamp': material('LED blanco', (.8,.94,1), .1, .16, .4, 1.5),
        'red': material('Óptica rubí', (.5,.005,.012), .25, .18, .7, .3),
        'amber': material('Intermitente ámbar', (1,.24,.008), .1, .2, .4, .6),
        'seat': material('Cuero negro', (.008,.010,.012), 0, .82),
        'brake': material('Pinza roja', (.5,.017,.013), .5, .28),
    }


def wheel(x, y, z, radius, width, zone, label, p, motorcycle=False):
    torus('Neumático '+label,(x,y,z),radius-width*.40,width*.40,p['rubber'],zone)
    rim=radius*.66
    for side in [-1,1]:
        face_x=x+side*width*.39
        torus('Talón del neumático '+label,(face_x,y,z),rim+.015,.012,p['rubber'],zone)
        torus('Aro mecanizado '+label,(face_x,y,z),rim,.014,p['alloy'],zone)
        torus('Banda lateral '+label,(face_x,y,z),radius*.86,.002,p['rubber'],zone)
        rod('Buje '+label,(x,y,z),(face_x,y,z),rim*.20,p['alloy'],zone)
        disc_x=x+side*width*.27
        rod('Disco de freno '+label,(disc_x-.005,y,z),(disc_x+.005,y,z),rim*.83,p['alloy'],zone,64)
        for a in range(18):
            angle=a*math.tau/18
            rod('Rebaje del rotor '+label,
                (disc_x+side*.006,y+math.sin(angle)*rim*.68,z+math.cos(angle)*rim*.68),
                (disc_x+side*.007,y+math.sin(angle)*rim*.68,z+math.cos(angle)*rim*.68),
                .006,p['trim'],zone,8)
        for a in range(5):
            angle=a*math.tau/5
            for offset in [-.12,.12]:
                vertices=[]
                for depth in [-.009,.009]:
                    for radial,theta in [(rim*.17,angle-.065),(rim*.96,angle+offset-.055),
                                         (rim*.96,angle+offset+.055),(rim*.17,angle+.065)]:
                        vertices.append((face_x+depth,y+math.sin(theta)*radial,z+math.cos(theta)*radial))
                mesh('Radio de llanta '+label,vertices,[(0,1,2,3),(7,6,5,4),
                    (0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],p['trim'] if motorcycle else p['alloy'],zone,.003)
            rod('Tornillo de rueda '+label,
                (face_x,y+math.sin(angle)*rim*.28,z+math.cos(angle)*rim*.28),
                (face_x+side*.01,y+math.sin(angle)*rim*.28,z+math.cos(angle)*rim*.28),.008,p['chrome'],zone,6)
        box('Pinza de freno '+label,(disc_x,y+rim*.67,z+.02),(.055,.06,.13),p['brake'],zone,.02)
    for a in range(48):
        angle=a*math.tau/48
        points=[]
        for dx, offset in [(-width*.27,-.022),(0,.022),(width*.27,-.022)]:
            theta=angle+offset
            radial=radius-.002-(abs(dx)/(width*.4))**2*width*.09
            points.append((x+dx,y+math.sin(theta)*radial,z+math.cos(theta)*radial))
        line('Banda de rodadura '+label,points,.003,p['trim'],zone)


def car():
    reset()
    p=palette()
    body=loft('Carrocería estructural',[
        (-2.25,.79,.49,.94,1.10),(-2.12,.90,.49,1.03,1.16),
        (-1.50,.95,.48,1.05,1.22),(-.65,.94,.46,1.04,1.23),
        (.60,.94,.46,1.04,1.21),(1.4,.94,.48,1.01,1.14),
        (2.08,.88,.50,.96,1.05),(2.24,.77,.53,.91,.97)],p['paint'],'habitaculo',.035)
    for y in [-1.40,1.40]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=72,radius=.455,depth=2.8,
            location=(0,y,.415),rotation=(0,math.pi/2,0))
        cutter=bpy.context.object
        bpy.context.view_layer.objects.active=body
        mod=body.modifiers.new('Paso de rueda real','BOOLEAN')
        mod.operation,mod.object='DIFFERENCE',cutter
        bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.data.objects.remove(cutter,do_unlink=True)
    loft('Capó',[(.84,.85,1.145,1.19,1.24),(1.12,.87,1.09,1.16,1.21),
        (1.80,.83,1.00,1.07,1.11),(2.10,.75,.97,1.01,1.035)],p['paint'],'delantera',.025)
    loft('Techo panorámico',[(-1.42,.67,1.58,1.63,1.66),(-1.10,.74,1.64,1.69,1.72),
        (.27,.73,1.65,1.70,1.73),(.61,.67,1.62,1.66,1.69)],p['glass'],'habitaculo',.022)
    panel('Parabrisas',[(-.83,1.03,1.22),(.83,1.03,1.22),(.68,.57,1.68),(-.68,.57,1.68)],p['glass'],'delantera')
    panel('Luneta trasera',[(-.84,-1.95,1.19),(.84,-1.95,1.19),(.67,-1.35,1.64),(-.67,-1.35,1.64)],p['glass'],'trasera')
    for side,label,zone in [(-1,'izquierdo','lateralIzquierdo'),(1,'derecho','lateralDerecho')]:
        panel('Marco integral de ventanillas '+label,[(side*.885,1.01,1.20),
            (side*.885,-1.90,1.20),(side*.69,-1.30,1.68),(side*.68,.58,1.70)],p['trim'],zone,.018)
        for name,vertices in [
            ('Cristal delantero',[(.89,.94,1.24),(.91,-.16,1.24),(.75,-.16,1.68),(.70,.53,1.67)]),
            ('Cristal trasero',[(.91,-.22,1.24),(.89,-1.19,1.24),(.73,-1.10,1.66),(.75,-.22,1.68)]),
            ('Cristal de custodia',[(.87,-1.27,1.24),(.85,-1.77,1.24),(.72,-1.24,1.61)])]:
            verts=[(side*x,y,z) for x,y,z in vertices]
            panel(name+' '+label,verts,p['glass'],zone)
            line('Marco de '+name.lower()+' '+label,verts+[verts[0]],.005,p['trim'],zone)
        rod('Pilar A '+label,(side*.84,1.02,1.20),(side*.69,.58,1.69),.029,p['paint'],zone)
        rod('Pilar B '+label,(side*.92,-.19,1.21),(side*.76,-.19,1.72),.027,p['trim'],zone)
        panel('Pilar C '+label,[(side*.92,-1.94,1.13),(side*.89,-1.79,1.22),
            (side*.71,-1.23,1.64),(side*.67,-1.40,1.66)],p['paint'],zone)
        for name,y0,y1 in [('delantera',-.16,.95),('trasera',-1.18,-.19)]:
            edge=[]
            for ya,za,yb,zb in [(y0,.62,y1,.62),(y1,.62,y1,1.16),
                                (y1,1.16,y0,1.17),(y0,1.17,y0,.62)]:
                edge.extend(side_point(body,side,ya+(yb-ya)*i/12,za+(zb-za)*i/12) for i in range(13))
            line('Junta de puerta '+name+' · lado '+label,edge,.0023,p['trim'],zone)
            loc=side_point(body,side,y0+.20,1.09,.018)
            ellipsoid('Manija '+name+' · lado '+label,loc,(.023,.087,.017),p['paint'],zone)
        box('Estribo '+label,(side*.89,0,.51),(.10,1.96,.13),p['trim'],zone,.025)
        rod('Brazo de espejo '+label,(side*.89,.77,1.25),(side*1.04,.74,1.32),.025,p['trim'],zone)
        ellipsoid('Retrovisor '+label,(side*1.06,.74,1.34),(.16,.12,.065),p['paint'],zone)
        ellipsoid('Cristal de retrovisor '+label,(side*1.06,.636,1.34),(.13,.01,.047),p['chrome'],zone)
        line('Intermitente de espejo '+label,[(side*.98,.837,1.34),(side*1.13,.81,1.34)],.006,p['lamp'],zone)
        line('Raíl de techo '+label,[(side*.58,-1.18,1.73),(side*.61,-1.01,1.80),
            (side*.61,.30,1.81),(side*.57,.46,1.75)],.018,p['alloy'],'habitaculo')
        for y,axle,name in [(1.40,'Del','delantero'),(-1.40,'Tra','trasero')]:
            wheel(side*.91,y,.415,.405,.245,f'rueda{axle}{"Izq" if side<0 else "Der"}',name+' '+label,p)
            points=[(side*.952,y+math.cos(a)*.458,.415+math.sin(a)*.458)
                for a in [i*math.pi/36 for i in range(37)]]
            line('Guardabarros '+name+' '+label,points,.032,p['trim'],zone)
        line('Limpiaparabrisas '+label,[(side*.24,1.045,1.23),(side*.54,.99,1.30),(side*.69,.88,1.39)],.007,p['trim'],'delantera')
    for y,zone in [(2.19,'delantera'),(-2.21,'trasera')]:
        box('Difusor '+zone,(0,y*1.035,.53),(1.35,.08,.16),p['trim'],zone,.035)
        box('Protector inferior '+zone,(0,y*1.057,.49),(.86,.03,.07),p['alloy'],zone,.018)
        box('Portamatrícula '+zone,(0,y*1.044,.73),(.49,.018,.13),p['trim'],zone,.008)
        box('Matrícula '+zone,(0,y*1.054,.73),(.44,.008,.105),p['alloy'],zone,.008)
        for side in [-1,1]:
            box('Carcasa óptica '+zone,(side*.61,y*.996,1.01 if y>0 else 1.08),(.40,.08,.053),p['trim'],zone,.024)
            for i in [-1,0,1]:
                ellipsoid('Proyector LED '+zone,(side*.61+i*.092,y*1.014,1.01 if y>0 else 1.075),(.033,.010,.011),p['lamp'] if y>0 else p['red'],zone)
            line('Firma luminosa '+zone,[(side*.43,y*1.024,1.025 if y>0 else 1.12),
                (side*.78,y*1.024,1.025 if y>0 else 1.12),(side*.80,y*1.022,.97 if y>0 else 1.06)],.008,p['lamp'] if y>0 else p['red'],zone)
            box('Toma de aire '+zone,(side*.66,y*1.040,.67),(.22,.024,.17),p['trim'],zone,.032)
    box('Parrilla central',(0,2.251,.86),(1.06,.035,.22),p['trim'],'delantera',.04)
    for x in range(-8,9):
        rod('Lama de parrilla',(x*.055,2.272,.775),(x*.055,2.272,.943),.006,p['alloy'],'delantera')
    for z in [.79,.83,.87,.91]:
        rod('Rejilla frontal',(-.49,2.279,z),(.49,2.279,z),.007,p['trim'],'delantera')
    loft('Alerón trasero',[(-1.52,.73,1.60,1.65,1.68),(-1.30,.69,1.65,1.70,1.72)],p['paint'],'trasera')
    box('Tercera luz de freno',(0,-1.53,1.644),(.34,.012,.018),p['red'],'trasera',.006)
    box('Protección de bajos',(0,0,.38),(1.25,3.6,.08),p['trim'],'parteInferior')
    for y in [-1.4,1.4]:
        rod('Eje de suspensión',(-.82,y,.40),(.82,y,.40),.044,p['alloy'],'parteInferior')
        for side in [-1,1]:
            rod('Brazo de suspensión',(side*.3,y-.2,.35),(side*.85,y,.42),.025,p['alloy'],'parteInferior')
    line('Tubería de escape',[(.35,1.5,.32),(.35,.3,.30),(.52,-.9,.29),(.52,-2.2,.32)],.03,p['chrome'],'parteInferior')
    box('Silenciador',(.52,-1.65,.31),(.26,.49,.12),p['alloy'],'parteInferior',.05)
    for x in [-.40,.40]:
        for y in [.14,-.85]:
            box('Asiento',(x,y,.95),(.51,.52,.16),p['seat'],'habitaculo',.065)
            box('Respaldo',(x,y-.22,1.18),(.50,.16,.48),p['seat'],'habitaculo',.065)
            box('Reposacabezas',(x,y-.23,1.47),(.27,.13,.17),p['seat'],'habitaculo',.045)
    box('Tablero',(0,.77,1.12),(1.44,.28,.18),p['trim'],'habitaculo',.06)
    torus('Volante',(-.40,.52,1.23),.16,.016,p['seat'],'habitaculo',axis='Z')
    partition_body(body,p)
    export_studio('inspection-suv',(-6,7,3.7),(0,0,.86),6.15)


def motorcycle():
    reset()
    p=palette(True)
    wheel(0,.79,.34,.34,.15,'ruedaDelantera','delantero',p,True)
    wheel(0,-.70,.34,.34,.19,'ruedaTrasera','trasero',p,True)
    for side,zone in [(-1,'lateralIzquierdo'),(1,'lateralDerecho')]:
        line('Bastidor tubular',[(side*.14,.43,.91),(side*.23,.10,.64),
            (side*.20,-.40,.52),(side*.15,-.27,.90),(side*.14,.43,.91)],.028,p['trim'],'chasis')
        line('Subchasis trasero',[(side*.20,-.30,.56),(side*.15,-.88,.85),(side*.15,-.24,.83)],.021,p['alloy'],'chasis')
        rod('Basculante',(side*.13,-.12,.43),(side*.13,-.70,.34),.034,p['trim'],'chasis')
        rod('Horquilla superior',(side*.115,.40,1.04),(side*.115,.66,.56),.026,p['trim'],'delantera')
        rod('Botella de suspensión',(side*.115,.63,.64),(side*.115,.79,.34),.022,p['alloy'],'delantera')
        rod('Estribera piloto',(side*.20,-.20,.47),(side*.33,-.20,.47),.015,p['alloy'],zone)
        rod('Estribera pasajero',(side*.15,-.59,.67),(side*.27,-.59,.67),.012,p['alloy'],zone)
        panel('Panel lateral metálico',[(side*.20,-.12,.87),(side*.27,.24,.91),
            (side*.26,.31,.73),(side*.21,.02,.61)],p['paint'],zone)
        panel('Cubierta lateral de motor',[(side*.21,-.40,.55),(side*.24,-.06,.64),
            (side*.22,.08,.53),(side*.18,-.03,.29)],p['paint'],zone)
        line('Acento rojo de depósito',[(side*.245,-.10,.88),(side*.273,.15,.93),
            (side*.256,.25,.89)],.008,p['accent'],zone)
        line('Acento rojo de colín',[(side*.16,-.54,.82),(side*.163,-.73,.855),
            (side*.10,-.90,.856)],.007,p['accent'],'trasera')
        panel('Aleta de radiador',[(side*.235,.28,.83),(side*.20,.45,.78),
            (side*.19,.40,.61),(side*.23,.22,.66)],p['trim'],zone)
        rod('Manillar',(0,.40,1.05),(side*.34,.36,1.07),.016,p['alloy'],'delantera')
        rod('Empuñadura',(side*.25,.36,1.07),(side*.39,.36,1.07),.021,p['rubber'],'delantera')
        line('Maneta',[(side*.26,.36,1.055),(side*.29,.42,1.05),(side*.40,.42,1.045)],.007,p['chrome'],'delantera')
        line('Soporte de retrovisor',[(side*.26,.37,1.10),(side*.30,.38,1.25),(side*.40,.39,1.29)],.008,p['trim'],'delantera')
        ellipsoid('Retrovisor',(side*.42,.39,1.29),(.075,.026,.045),p['trim'],'delantera')
        ellipsoid('Cristal de retrovisor',(side*.42,.366,1.29),(.063,.005,.034),p['chrome'],'delantera')
        for y,z,light_zone in [(.49,.91,'delantera'),(-.94,.80,'trasera')]:
            rod('Soporte de intermitente',(side*.12,y,z),(side*.23,y,z),.008,p['trim'],light_zone)
            ellipsoid('Intermitente',(side*.24,y,z),(.031,.018,.014),p['amber'],light_zone)
    loft('Depósito de combustible',[(-.30,.13,.77,.86,.90),(-.16,.22,.75,.96,1.005),
        (.10,.255,.76,1.005,1.045),(.30,.19,.81,.98,1.005),(.37,.11,.86,.92,.95)],p['paint'],'chasis',.04)
    rod('Tapón de combustible',(0,.09,1.038),(0,.09,1.05),.047,p['alloy'],'chasis',48)
    box('Cierre de tapón',(0,.09,1.053),(.045,.015,.005),p['trim'],'chasis',.004)
    loft('Asiento piloto',[(-.60,.17,.80,.83,.85),(-.41,.19,.79,.83,.855),(-.20,.14,.81,.84,.86)],p['seat'],'chasis',.025)
    loft('Asiento pasajero',[(-.87,.10,.85,.88,.90),(-.68,.16,.82,.89,.92),(-.59,.16,.82,.85,.88)],p['seat'],'chasis',.025)
    loft('Colín',[(-.97,.075,.80,.83,.87),(-.77,.16,.79,.84,.87),(-.55,.18,.77,.79,.82)],p['paint'],'trasera',.024)
    box('Luz trasera LED',(0,-.957,.844),(.13,.022,.027),p['red'],'trasera',.01)
    line('Portamatrícula',[(0,-.81,.80),(0,-1.04,.62),(0,-1.04,.53)],.015,p['trim'],'trasera')
    box('Matrícula',(0,-1.05,.56),(.20,.012,.13),p['alloy'],'trasera',.008)
    box('Bloque motor',(0,-.015,.49),(.36,.35,.25),p['trim'],'chasis',.065)
    box('Culata',(0,.09,.65),(.38,.22,.20),p['alloy'],'chasis',.024)
    for z in [.57,.595,.62,.645,.67,.695,.72]:
        box('Aleta de refrigeración',(0,.08,z),(.40,.25,.009),p['trim'],'chasis',.004)
    for side in [-1,1]:
        rod('Tapa de cárter',(side*.16,-.08,.46),(side*.215,-.08,.46),.12,p['alloy'],'chasis',48)
        for a in range(8):
            angle=a*math.tau/8
            rod('Tornillo de cárter',(side*.215,-.08+math.sin(angle)*.098,.46+math.cos(angle)*.098),
                (side*.224,-.08+math.sin(angle)*.098,.46+math.cos(angle)*.098),.006,p['chrome'],'chasis',6)
    box('Radiador',(0,.35,.66),(.33,.055,.25),p['trim'],'delantera',.015)
    for z in range(14):
        rod('Lama de radiador',(-.145,.382,.553+z*.016),(.145,.382,.553+z*.016),.003,p['alloy'],'delantera')
    for x in [-.12,-.04,.04,.12]:
        line('Colector de escape',[(x,.22,.62),(x,.29,.53),(x,.25,.32),
            (x,.10,.24),(.15,-.28,.25),(.24,-.50,.34)],.017,p['chrome'],'chasis')
    rod('Silenciador',(.24,-.42,.32),(.27,-.87,.46),.061,p['trim'],'lateralDerecho',48)
    rod('Boca de escape',(.27,-.87,.46),(.273,-.89,.47),.048,p['alloy'],'lateralDerecho',48)
    rod('Interior de escape',(.274,-.892,.472),(.275,-.895,.473),.034,p['rubber'],'lateralDerecho',32)
    rod('Amortiguador trasero',(0,-.32,.45),(0,-.44,.77),.022,p['alloy'],'chasis')
    spring=[(.048*math.cos(a),-.32-.12*t,.45+.32*t+.014*math.sin(a))
        for t,a in [(i/180,i/180*math.tau*9) for i in range(181)]]
    line('Muelle de suspensión',spring,.007,p['brake'],'chasis')
    for y,z,radius in [(-.70,.34,.145),(-.15,.43,.065)]:
        rod('Piñón de transmisión',(-.118,y,z),(-.132,y,z),radius,p['alloy'],'lateralIzquierdo',48)
    chain=[(-.14,-.70+math.cos(a)*.15,.34+math.sin(a)*.15) for a in [math.pi/2+i*math.pi/28 for i in range(29)]]
    chain += [(-.14,-.15+math.cos(a)*.07,.43+math.sin(a)*.07) for a in [-math.pi/2+i*math.pi/28 for i in range(29)]]
    line('Cadena de transmisión',chain+[chain[0]],.009,p['alloy'],'lateralIzquierdo')
    verts=[]
    for i in range(25):
        a=.25+(math.pi-.5)*i/24
        for x in [-.09,.09]:
            verts.append((x,.79+math.cos(a)*.385,.34+math.sin(a)*.385))
    fender=mesh('Guardabarros delantero',verts,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(24)],p['paint'],'delantera',smooth=True)
    fender.modifiers.new('Espesor','SOLIDIFY').thickness=.009
    lens=[(-.095,.63,.995),(.095,.63,.995),(.115,.64,.94),(.071,.65,.84),
        (0,.66,.81),(-.071,.65,.84),(-.115,.64,.94)]
    panel('Carcasa angular de faro',[(x*1.12,y-.027,z) for x,y,z in lens],p['trim'],'delantera',.075)
    panel('Lente de faro',lens,p['glass'],'delantera',.014)
    for side in [-1,1]:
        line('Firma LED',[(side*.024,.645,.975),(side*.085,.655,.95),(side*.055,.665,.855)],.006,p['lamp'],'delantera')
    box('Cuadro de instrumentos',(0,.41,1.075),(.14,.075,.035),p['trim'],'delantera',.012)
    box('Pantalla de instrumentos',(0,.407,1.095),(.117,.051,.006),p['glass'],'delantera',.004)
    line('Latiguillo de freno',[(-.23,.37,1.07),(-.18,.45,.92),(-.15,.60,.64),(-.14,.81,.39)],.004,p['rubber'],'delantera')
    rod('Pata lateral',(-.17,-.18,.39),(-.29,-.29,.045),.013,p['trim'],'chasis')
    export_studio('inspection-motorcycle',(-3.7,4.6,2.6),(0,-.02,.65),2.95)


if __name__ == '__main__':
    target=sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else 'all'
    if target not in ('all','car','moto'):
        raise SystemExit('Expected car, moto, or no argument for both.')
    if target in ('all','car'):
        car()
    if target in ('all','moto'):
        motorcycle()
