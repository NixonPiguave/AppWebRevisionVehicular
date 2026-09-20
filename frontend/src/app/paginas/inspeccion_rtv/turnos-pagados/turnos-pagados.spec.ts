import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { TurnosPagadosComponent } from './turnos-pagados';
import { TurnosService } from '../../../services/administracion/Turnos.service';
import { Turnos } from '../../../models/Turnos.model';

describe('Inspection queue', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }),
  );

  it('finds vehicles by plate and ignores accents when searching owners', () => {
    const component = TestBed.createComponent(TurnosPagadosComponent).componentInstance;
    component.turnos = [
      {
        turnoId: 43,
        servicioId: 1,
        vehiculoDescripcion: 'Toyota GUC-9001',
        propietarioNombre: 'María Pérez',
      } as Turnos,
    ];
    component.busqueda = 'maria';
    expect(component.turnosFiltrados.length).toBe(1);
    component.busqueda = 'guc-9001';
    expect(component.turnosFiltrados.length).toBe(1);
    component.busqueda = 'no existe';
    expect(component.turnosFiltrados.length).toBe(0);
    expect(component.totalPaginas).toBe(1);
  });

  it('does not load the queue until services are ready to classify the turns', () => {
    const service = TestBed.inject(TurnosService);
    const calls = vi.spyOn(service, 'getPagados').mockReturnValue(of([]));
    const component = TestBed.createComponent(TurnosPagadosComponent).componentInstance;
    component.lineaSeleccionada = { id: 2, nombre: 'Carros' } as typeof component.lineaSeleccionada;
    component.cargarTurnosPagados();
    expect(calls).not.toHaveBeenCalled();
    component.serviciosCargados = true;
    component.cargarTurnosPagados();
    expect(calls).toHaveBeenCalledOnce();
    expect(component.cargando).toBe(false);
  });

  it('ignores pending-method responses after closing the detail panel', () => {
    const pending = new Subject<{ id: number; nombre: string }[]>();
    vi.spyOn(TestBed.inject(TurnosService), 'getMetodosInspeccionPendientes').mockReturnValue(
      pending,
    );
    const component = TestBed.createComponent(TurnosPagadosComponent).componentInstance;
    component.abrirModalMetodos({ turnoId: 43, vehiculoId: 20 } as Turnos);
    component.cerrarModal();
    pending.next([{ id: 1, nombre: 'Visual' }]);
    expect(component.mostrarModal).toBe(false);
    expect(component.metodosPendientes).toEqual([]);
  });
});
