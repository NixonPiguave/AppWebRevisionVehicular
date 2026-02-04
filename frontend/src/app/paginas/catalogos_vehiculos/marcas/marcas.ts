import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MarcasService, Marca } from '../../../services/catalogos_vehiculos/marcas.service';

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './marcas.html',
  styleUrl: './marcas.css',
})
export class MarcasComponent implements OnInit {

  marcas: Marca[] = [];
  cargando = false;
  error = '';
  filtro = '';

  registrosPorPagina = 10;
  paginaActual = 1;

  mostrarModalForm = false;
  modoEdicion = false;
  guardando = false;

  marcaEditando: Marca = {
    id: null,
    nombre: '',
    empresa: '',
    grupoAutomotriz: '',
    paisOrigen: '',
    logoUrl: '',
    estado: 'A'
  };

  mostrarModalDetalle = false;
  marcaDetalle: Marca | null = null;

  constructor(
    private marcasService: MarcasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas(): void {
    this.cargando = true;
    this.marcasService.listarMarcas().subscribe({
      next: data => {
        this.marcas = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar marcas';
        this.cargando = false;
      }
    });
  }

  guardarMarca(): void {
    if (!this.marcaEditando.nombre.trim()) return;

    this.guardando = true;

    if (this.modoEdicion && this.marcaEditando.id) {
      this.marcasService.actualizarMarca(
        this.marcaEditando.id,
        this.marcaEditando
      ).subscribe({
        next: () => {
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al actualizar');
        }
      });
    } else {
      this.marcasService.crearMarca(this.marcaEditando).subscribe({
        next: () => {
          this.cargarMarcas();
          this.cerrarModalForm();
          this.guardando = false;
        },
        error: () => {
          this.guardando = false;
          alert('Error al crear');
        }
      });
    }
  }

  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.marcaEditando = {
      id: null,
      nombre: '',
      empresa: '',
      grupoAutomotriz: '',
      paisOrigen: '',
      logoUrl: '',
      estado: 'A'
    };
    this.mostrarModalForm = true;
  }

  abrirModalEditar(marca: Marca): void {
    this.modoEdicion = true;
    this.marcaEditando = { ...marca };
    this.mostrarModalForm = true;
  }

  cerrarModalForm(): void {
    this.mostrarModalForm = false;
  }

  verDetalle(marca: Marca): void {
    this.marcaDetalle = marca;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }

  getEstadoTexto(estado: string): string {
    return estado === 'A' ? 'Activo' : 'Inactivo';
  }
}
