package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.TipoDefectoDTO;
import com.revisionvehicular.backend.entities.rtv.TipoDefecto;
import com.revisionvehicular.backend.repositories.rtv.ITipoDefectoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TipoDefectoServiceImpl implements ITipoDefectoService {

    private final ITipoDefectoRepository tipoDefectoRepository;
    private final AuditoriaService auditoriaService;

    public TipoDefectoServiceImpl(ITipoDefectoRepository tipoDefectoRepository, AuditoriaService auditoriaService) {
        this.tipoDefectoRepository = tipoDefectoRepository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    @Transactional
    public TipoDefectoDTO crearTipoDefecto(TipoDefectoDTO tipoDefectoDTO) {
        // Ejecutar el stored procedure para insertar
        tipoDefectoRepository.spInsertarTipoDefecto(
                tipoDefectoDTO.getCodigo(),
                tipoDefectoDTO.getNombre(),
                tipoDefectoDTO.getDescripcion(),
                tipoDefectoDTO.getEstado()
        );

        // Buscar el registro recién creado por código (que debe ser único)
        TipoDefecto creado = tipoDefectoRepository.findByCodigo(tipoDefectoDTO.getCodigo())
                .orElseThrow(() -> new RuntimeException("Error al crear tipo de defecto"));
        auditoriaService.registrar("INSERT", "TipoDefecto", "Creó tipo de defecto \"" + tipoDefectoDTO.getNombre() + "\" " + tipoDefectoDTO.getCodigo());
        return convertirADTO(creado);
    }

    @Override
    @Transactional
    public TipoDefectoDTO modificarTipoDefecto(Long id, TipoDefectoDTO tipoDefectoDTO) {
        // Ejecutar el stored procedure para modificar
        tipoDefectoRepository.spModificarTipoDefecto(
                id,
                tipoDefectoDTO.getCodigo(),
                tipoDefectoDTO.getNombre(),
                tipoDefectoDTO.getDescripcion(),
                tipoDefectoDTO.getEstado()
        );

        // Buscar el registro actualizado
        TipoDefecto modificado = tipoDefectoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de defecto no encontrado"));
        auditoriaService.registrar("UPDATE", "TipoDefecto", "Actualizó tipo de defecto \"" + tipoDefectoDTO.getNombre() + "\" (ID: " + id + ")");
        return convertirADTO(modificado);
    }

    @Override
    public List<TipoDefectoDTO> listarTodos() {
        return tipoDefectoRepository.findAll()
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TipoDefectoDTO> buscarPorId(Long id) {
        return tipoDefectoRepository.findById(id)
                .map(this::convertirADTO);
    }

    @Override
    public Optional<TipoDefectoDTO> buscarPorCodigo(String codigo) {
        return tipoDefectoRepository.findByCodigo(codigo)
                .map(this::convertirADTO);
    }

    // Método auxiliar para convertir Entity a DTO
    private TipoDefectoDTO convertirADTO(TipoDefecto entity) {
        TipoDefectoDTO dto = new TipoDefectoDTO();
        dto.setId(entity.getTipo_defecto_id());
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }

    // Método auxiliar para convertir DTO a Entity (si lo necesitas)
    private TipoDefecto convertirAEntity(TipoDefectoDTO dto) {
        TipoDefecto entity = new TipoDefecto();
        entity.setTipo_defecto_id(dto.getId());
        entity.setCodigo(dto.getCodigo());
        entity.setNombre(dto.getNombre());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEstado(dto.getEstado());
        return entity;
    }
}