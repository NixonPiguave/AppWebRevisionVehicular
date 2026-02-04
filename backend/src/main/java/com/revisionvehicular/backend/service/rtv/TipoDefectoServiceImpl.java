package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.entities.rtv.TipoDefecto;
import com.revisionvehicular.backend.repositories.rtv.ITipoDefectoRepository;
import com.revisionvehicular.backend.services.rtv.ITipoDefectoService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TipoDefectoServiceImpl implements ITipoDefectoService {

    private final ITipoDefectoRepository tipoDefectoRepository;

    public TipoDefectoServiceImpl(ITipoDefectoRepository tipoDefectoRepository) {
        this.tipoDefectoRepository = tipoDefectoRepository;
    }

    @Override
    public void crearTipoDefecto(TipoDefecto tipoDefecto) {
        tipoDefectoRepository.spInsertarTipoDefecto(
                tipoDefecto.getCodigo(),
                tipoDefecto.getNombre(),
                tipoDefecto.getDescripcion(),
                tipoDefecto.getEstado()
        );
    }

    @Override
    public void modificarTipoDefecto(Long id, TipoDefecto tipoDefecto) {
        tipoDefectoRepository.spModificarTipoDefecto(
                id,
                tipoDefecto.getCodigo(),
                tipoDefecto.getNombre(),
                tipoDefecto.getDescripcion(),
                tipoDefecto.getEstado()
        );
    }

    @Override
    public List<TipoDefecto> listarTodos() {
        return tipoDefectoRepository.findAll();
    }

    @Override
    public Optional<TipoDefecto> buscarPorId(Long id) {
        return tipoDefectoRepository.findById(id);
    }

    @Override
    public Optional<TipoDefecto> buscarPorCodigo(String codigo) {
        return tipoDefectoRepository.findByCodigo(codigo);
    }
}
