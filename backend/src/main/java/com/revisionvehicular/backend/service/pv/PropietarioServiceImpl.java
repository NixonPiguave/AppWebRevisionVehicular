package com.revisionvehicular.backend.service.pv;

import com.revisionvehicular.backend.dtos.pv.PropietarioDTO;
import com.revisionvehicular.backend.entities.pv.Propietario;
import com.revisionvehicular.backend.repositories.pv.IPropietarioRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropietarioServiceImpl implements IPropietarioService {

    private final IPropietarioRepository repository;
    private final AuditoriaService auditoriaService;

    public PropietarioServiceImpl(IPropietarioRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
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
        LocalDate fechaRegistro = dto.getFechaRegistro() != null ? dto.getFechaRegistro() : LocalDate.now();

        repository.insertarPropietario(
                dto.getDocumentoIdentidad(),
                dto.getNombre(),
                dto.getTelefono(),
                dto.getCorreo(),
                dto.getDireccion(),
                fechaRegistro
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
        auditoriaService.registrar("INSERT", "Propietario", "Creó propietario \"" + dto.getNombre() + "\" " + dto.getDocumentoIdentidad());
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
        auditoriaService.registrar("UPDATE", "Propietario", "Actualizó propietario \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(actualizado);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            Propietario p = repository.findById(id).orElse(null);
            String nombre = p != null ? p.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Propietario", "Eliminó propietario \"" + nombre + "\" (ID: " + id + ")");
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

    @Override
    public List<PropietarioDTO> buscarElegiblesSinMultas(String cedula) {
        return repository.buscarElegiblesSinMultas(cedula)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
