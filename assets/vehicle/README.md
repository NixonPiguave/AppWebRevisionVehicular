# Vehículo para inspección visual

SUV genérico estilizado creado para este proyecto. No representa una marca ni sustituye fotografías del vehículo inspeccionado.

- `inspection-suv.blend`: fuente editable y escena de estudio en Blender 4.5.
- `inspection-suv-preview.png`: render de referencia.
- `../../frontend/public/models/inspection-suv.glb`: modelo para la aplicación (223 piezas, aproximadamente 2,5 MB).
- `create_vehicle.py`: generador reproducible. Ejecutar con `blender --background --python assets/vehicle/create_vehicle.py` desde la raíz del proyecto; sobrescribe estos artefactos generados.

Cada objeto exportado contiene `zone` y `partLabel` como propiedades personalizadas. Al exportar desde Blender, activar Custom Properties / Extras y exportar solamente la geometría del vehículo, excluyendo cámara, luces y suelo del estudio.

Zonas: delantera, trasera, lateralIzquierdo, lateralDerecho, ruedaDelIzq, ruedaDelDer, ruedaTraIzq, ruedaTraDer, habitaculo y parteInferior. Ejes en Blender: +Y hacia el frente, X transversal y Z arriba. El GLB usa Y arriba y -Z hacia el frente.

El visor permite girar, acercar y observar los bajos. Seleccionar una pieza alterna su zona en el filtro existente; esto todavía no crea un hallazgo con coordenadas 3D. Guardar coordenadas, fotografías y asociaciones individuales entre pieza y defecto requiere ampliar el contrato de inspección. El interior contiene asientos y tablero básicos, pero no incluye apertura animada de puertas. La moto continúa siendo el esquema provisional del visor.
