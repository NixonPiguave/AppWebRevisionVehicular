package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.DefectoDTO;
import com.revisionvehicular.backend.entities.rtv.Defecto;
import com.revisionvehicular.backend.repositories.rtv.IDefectoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DefectoServiceImpl implements IDefectoService {

    private final IDefectoRepository repository;

    public DefectoServiceImpl(IDefectoRepository repository) {
        this.repository = repository;
    }

    private DefectoDTO toDTO(Defecto entity) {

        DefectoDTO dto = new DefectoDTO();
        dto.setId(entity.getDefectoid());
        dto.setCodigo(entity.getCodigo());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        dto.setTipoDefectoId(entity.getTipoDefecto().getTipo_defecto_id());
        dto.setSubfamiliaId(entity.getSubfamilia().getSubfamilia_id());
        dto.setCategoriaId(entity.getRtvCategoria().getRtvcategoria_id());

        return dto;
    }

    @Override
    public DefectoDTO save(DefectoDTO dto) {

        repository.insertarDefecto(
                dto.getCodigo(),
                dto.getDescripcion(),
                dto.getTipoDefectoId(),
                dto.getSubfamiliaId(),
                dto.getCategoriaId(),
                dto.getEstado()
        );

        Defecto defecto = repository.findAll()
                .stream()
                .filter(d -> d.getCodigo().equals(dto.getCodigo()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar defecto")
                );

        return toDTO(defecto);
    }

    @Override
    public DefectoDTO update(Long id, DefectoDTO dto) {

        Defecto existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Defecto no encontrado con ID: " + id)
                );

        repository.actualizarDefecto(
                id,
                dto.getCodigo(),
                dto.getDescripcion(),
                dto.getTipoDefectoId(),
                dto.getSubfamiliaId(),
                dto.getCategoriaId(),
                dto.getEstado()
        );

        Defecto actualizado = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar defecto")
                );

        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {

        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El defecto no existe");
        }
    }

    @Override
    public DefectoDTO findById(Long id) {

        Defecto defecto = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Defecto no encontrado con ID: " + id)
                );

        return toDTO(defecto);
    }

    @Override
    public List<DefectoDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}