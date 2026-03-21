package com.revisionvehicular.backend.service.rtv;

/**
 * Vehículo bloqueado (activo) o dado de baja (concluido) no debe acumular recargos ni multas
 * por no presentarse a la revisión técnica anual.
 */
public interface IVehiculoExentoSancionesRtvAnualService {

    boolean estaExento(Long vehiculoId);
}
