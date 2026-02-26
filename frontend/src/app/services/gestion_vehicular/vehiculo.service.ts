import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Vehiculo {
  id: number | null;
  propietarioId: number;
  matricula: string;
  chasis: string;
  vin: string;
  modeloVehiculoId: number;
  anioFabricacion: number;
  color: string;
  estado: string;
  capacidadPasajeros: number;
  tipoVehiculoId: number;
  capCargaId: number;
  ambitoOperacionalId: number;
  ejesId: number;
  traccionId: number;
  tipoCombustibleId: number;
  tipoMatriculaId: number;
  subcategoriaId: number;
}
export interface AmbitoOperacional {
  id: number | null;
  ambito: string;
  descripcion: string;
  estado: string;
}
export interface CapacidadCarga {
  id: number | null;
  capacidad: string;
  descripcion: string;
  estado: string;
  unidad: string;
}
export interface Categoria {
  categoriaid?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  estado: string;
}
export interface Clase {
  id: number | null;
  clase: string;
  descripcion: string;
  estado: string;
}
export interface Eje {
  id: number | null;
  cantidad: number | null;
  descripcion: string;
  estado: string;
}
export interface MarcaVehiculo {
  id: number | null;
  nombre: string;
  empresa: string;
  paisOrigen: string;
  grupoAutomotriz: string;
  fechaAlta: string | null;
  fechaBaja: string | null;
  logoUrl: string;
  estado: string;
}
export interface Modelo {
  id:number;
  nombre: string;
  anioDesde: number;
  anioHasta: number;
  estado: string;
  marcaId: number;
}
export interface Subcategoria {
  id: number | null;
  codigoSubcategoria: string;
  nombre: string;
  descripcion: string;
  estado: string;
  categoriaId: number;
  codigo?: string;
}
export interface TipoCombustible {
  Id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}

export interface TipoMatricula {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
}
export interface TipoVehiculo {
  id: number | null;
  nombre: string;
  descripcion: string;
  estado: string;
  claseId: number;
  claseNombre?: string;
}
export interface Traccion {
  id: number | null;
  tipo: string;
  descripcion: string;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private apiUrl = 'http://localhost:8080/api/vehiculos';
  private apiAmbito = 'http://localhost:8080/api/ambito';
  private apiCapcarga = 'http://localhost:8080/api/capcarga';
  private apiCategorias = 'http://localhost:8080/api/categorias';
  private apiClases = 'http://localhost:8080/api/clases';
  private apiEjes = 'http://localhost:8080/api/ejes';
  private apiMarcas = 'http://localhost:8080/api/marcas';
  private apiModelo = 'http://localhost:8080/api/modelosvehiculo';
  private apiSubcategorias = 'http://localhost:8080/api/subcategorias';
  private apiCombustible = 'http://localhost:8080/api/combustible';
  private apiTipomatricula = 'http://localhost:8080/api/tipomatricula';
  private apiTipoVehiculo = 'http://localhost:8080/api/tipoVehiculo';
  private apiTracciones = 'http://localhost:8080/api/tracciones';

  constructor(private http: HttpClient) {}

  listar(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.apiUrl}/${id}`);
  }

  crear(vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.apiUrl, vehiculo);
  }

  actualizar(id: number, vehiculo: Vehiculo): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.apiUrl}/${id}`, vehiculo);
  }

  //======================================================//
  //================CATALOGO VEHICULOS====================//
  //======================================================//

  listarAmbitosOperacionales(): Observable<AmbitoOperacional[]> {
    return this.http.get<AmbitoOperacional[]>(this.apiAmbito);
  }
  listarCapacidadesCarga(): Observable<CapacidadCarga[]> {
    return this.http.get<CapacidadCarga[]>(this.apiCapcarga);
  }
  listarCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiCategorias);
  }
  listarClases(): Observable<Clase[]> {
    return this.http.get<Clase[]>(this.apiClases);
  }
  listarEjes(): Observable<Eje[]> {
    return this.http.get<Eje[]>(this.apiEjes);
  }
  listarMarcas(): Observable<MarcaVehiculo[]> {
    return this.http.get<MarcaVehiculo[]>(this.apiMarcas);
  }
  listarModelo(): Observable<Modelo[]> {
    return this.http.get<Modelo[]>(this.apiModelo);
  }
  listarSubcategoria(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(this.apiSubcategorias);
  }
  listarTiposCombustible(): Observable<TipoCombustible[]> {
    return this.http.get<TipoCombustible[]>(this.apiCombustible);
  }

  listarTiposMatricula(): Observable<TipoMatricula[]> {
    return this.http.get<TipoMatricula[]>(this.apiTipomatricula);
  }
  listarTipoVehiculo(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(this.apiTipoVehiculo);
  }
  listarTracciones(): Observable<Traccion[]> {
    return this.http.get<Traccion[]>(this.apiTracciones);
  }

}
