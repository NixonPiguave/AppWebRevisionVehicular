package com.revisionvehicular.backend.service;

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
    @Autowired
    public RolServiceImpl(IRolRepository repository) {
        this.repository = repository;
    }
    @Override
    public RolDTO save(RolDTO dto) {
        repository.spInsertarRol(dto.getNombre(), dto.getEstado());
        Rol rol = repository
                .getRolByNombre(dto.getNombre())
                .orElseThrow(() -> new RuntimeException("Error al crear rol"));
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
    @Override
    public RolDTO update(Long id, RolDTO dto) {
        Rol rol = repository.findById(id).
                orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
        rol.setNombre(dto.getNombre());
        rol.setEstado(dto.getEstado());
        Rol updated = repository.save(rol);
        return toDTO(updated);
    }
    @Override
    public void delete(Long id) {
        if(repository.existsById(id)){
            repository.deleteById(id);
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

