package com.revisionvehicular.backend.service.pv;

import com.revisionvehicular.backend.dtos.pv.PropietarioDTO;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.repositories.pv.IPropietarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropietarioServiceImpl implements IPropietarioService {

    private final IPropietarioRepository repository;

    public PropietarioServiceImpl(IPropietarioRepository repository) {
        this.repository = repository;
    }

    private PropietarioDTO toDTO(Propietario propietario) {
        PropietarioDTO dto = new PropietarioDTO();
        dto.setIdPropietario(propietario.getIdPropietario());
        dto.setDocumentoIdentidad(propietario.getDocumentoIdentidad());
        dto.setNombre(propietario.getNombre());
        dto.setTelefono(propietario.getTelefono());
        dto.setCorreo(propietario.getCorreo());
        dto.setDireccion(propietario.getDireccion());
        dto.setFechaRegistro(propietario.getFecharegistro());
        return dto;
    }

    @Override
    public PropietarioDTO save(PropietarioDTO dto) {

        repository.insertarPropietario(
                dto.getDocumentoIdentidad(),
                dto.getNombre(),
                dto.getTelefono(),
                dto.getCorreo(),
                dto.getDireccion(),
                dto.getFechaRegistro()
        );

        Propietario propietario = repository.findAll()
                .stream()
                .filter(p ->
                        p.getDocumentoIdentidad().equals(dto.getDocumentoIdentidad())
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Error al insertar propietario")
                );

        return toDTO(propietario);
    }

    @Override
    public PropietarioDTO update(Long id, PropietarioDTO dto) {

        Propietario existente = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Propietario no encontrado con ID: " + id)
                );

        repository.actualizarPropietario(
                id,
                dto.getDocumentoIdentidad(),
                dto.getNombre(),
                dto.getTelefono(),
                dto.getCorreo(),
                dto.getDireccion(),
                dto.getFechaRegistro()
        );

        Propietario actualizado = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Error al actualizar propietario")
                );

        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        } else {
            throw new RuntimeException("El propietario no existe");
        }
    }

    @Override
    public PropietarioDTO findById(Long id) {

        Propietario propietario = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Propietario no encontrado con ID: " + id)
                );

        return toDTO(propietario);
    }

    @Override
    public List<PropietarioDTO> findAll() {
        return repository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
