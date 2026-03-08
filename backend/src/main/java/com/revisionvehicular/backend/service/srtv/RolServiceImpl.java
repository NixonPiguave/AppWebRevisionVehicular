package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.RolDTO;
import com.revisionvehicular.backend.entities.srtv.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.revisionvehicular.backend.repositories.srtv.IRolRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RolServiceImpl implements IRolService{
    private final IRolRepository repository;
    private final AuditoriaService auditoriaService;

    @Autowired
    public RolServiceImpl(IRolRepository repository, AuditoriaService auditoriaService) {
        this.repository = repository;
        this.auditoriaService = auditoriaService;
    }
    @Override
    public RolDTO save(RolDTO dto) {
        repository.spInsertarRol(
                dto.getNombre(),
                dto.getEstado(),
                dto.getPermisosJson()
        );
        Rol rol = repository.getRolByNombre(dto.getNombre())
                .orElseThrow(() -> new RuntimeException("Error al crear rol"));
        auditoriaService.registrar("INSERT", "Rol", "Creó el rol \"" + dto.getNombre() + "\"");
        return toDTO(rol);
    }
    @Override
    public RolDTO findById(Long id) {
        Rol rol = repository.findById(id).
                orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
        return toDTO(rol);
    }
    @Override
    public List<RolDTO> findAll() {
        return repository.findAll().stream().
                map(this::toDTO).collect(Collectors.toList());
    }
//    @Override
//    public RolDTO update(Long id, RolDTO dto) {
//        Rol rol = repository.findById(id).
//                orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
//        rol.setNombre(dto.getNombre());
//        rol.setEstado(dto.getEstado());
//        Rol updated = repository.save(rol);
//        return toDTO(updated);
//    }

    @Override
    public RolDTO update(Long id, RolDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Rol no encontrado con ID: " + id);
        }
        repository.spActualizarRol(id, dto.getNombre(), dto.getEstado(), dto.getPermisosJson());
        Rol rolActualizado = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar el rol actualizado"));
        auditoriaService.registrar("UPDATE", "Rol", "Actualizó el rol \"" + dto.getNombre() + "\" (ID: " + id + ")");
        return toDTO(rolActualizado);
    }

    @Override
    public void delete(Long id) {
        if(repository.existsById(id)){
            Rol r = repository.findById(id).orElse(null);
            String nombre = r != null ? r.getNombre() : "ID " + id;
            repository.deleteById(id);
            auditoriaService.registrar("DELETE", "Rol", "Eliminó el rol \"" + nombre + "\" (ID: " + id + ")");
        }
        else{
            throw new RuntimeException("El rol no existe");
        }
    }
    private RolDTO toDTO(Rol rol){
        RolDTO dto = new RolDTO();
        dto.setNombre(rol.getNombre());
        dto.setEstado(rol.getEstado());
        dto.setRolId(rol.getRolId());
        return dto;
    }
}

