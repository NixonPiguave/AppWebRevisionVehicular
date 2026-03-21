package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.repositories.rtv.IBajaVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.IBloqueoVehiculoRepository;
import org.springframework.stereotype.Service;

@Service
public class VehiculoExentoSancionesRtvAnualServiceImpl implements IVehiculoExentoSancionesRtvAnualService {

    private static final String BLOQUEO_ACTIVO = "ACTIVO";
    private static final String BAJA_CONCLUIDA = "CONCLUIDO";

    private final IBloqueoVehiculoRepository bloqueoVehiculoRepository;
    private final IBajaVehiculoRepository bajaVehiculoRepository;

    public VehiculoExentoSancionesRtvAnualServiceImpl(IBloqueoVehiculoRepository bloqueoVehiculoRepository,
                                                     IBajaVehiculoRepository bajaVehiculoRepository) {
        this.bloqueoVehiculoRepository = bloqueoVehiculoRepository;
        this.bajaVehiculoRepository = bajaVehiculoRepository;
    }

    @Override
    public boolean estaExento(Long vehiculoId) {
        if (vehiculoId == null) {
            return false;
        }
        if (bloqueoVehiculoRepository.existsByVehiculoVehiculoidAndEstadoIgnoreCase(vehiculoId, BLOQUEO_ACTIVO)) {
            return true;
        }
        return bajaVehiculoRepository.existsByVehiculoVehiculoidAndEstado(vehiculoId, BAJA_CONCLUIDA);
    }
}
