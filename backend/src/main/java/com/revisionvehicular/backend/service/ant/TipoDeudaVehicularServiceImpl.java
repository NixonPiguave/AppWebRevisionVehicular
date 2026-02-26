package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TipoDeudaVehicularDTO;
import com.revisionvehicular.backend.entities.ant.TipoDeudaVehicular;
import com.revisionvehicular.backend.repositories.ant.ITipoDeudaVehicularRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TipoDeudaVehicularServiceImpl implements ITipoDeudaVehicularService {

    private final ITipoDeudaVehicularRepository repository;

    public TipoDeudaVehicularServiceImpl(ITipoDeudaVehicularRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(TipoDeudaVehicularDTO dto) {
        repository.spInsertarTipoDeudaVehicular(dto.getCodigo(), dto.getNombre(), dto.getDescripcion(), dto.getEstado());
    }

    @Override
    public void actualizar(Long id, TipoDeudaVehicularDTO dto) {
        repository.spActualizarTipoDeudaVehicular(id, dto.getCodigo(), dto.getNombre(), dto.getDescripcion(), dto.getEstado());
    }

    @Override
    public void eliminar(Long id) {
        if(repository.existsById(id)){
            repository.deleteById(id);
        }
        else{
            throw new RuntimeException("El tipo de deuda vehicular no existe");
        }
    }
    @Override
    public List<TipoDeudaVehicularDTO> listar() {
        return repository.findAll().stream().map(this::convertirDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<TipoDeudaVehicularDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertirDTO);
    }

    private TipoDeudaVehicularDTO convertirDTO(TipoDeudaVehicular entity) {
        TipoDeudaVehicularDTO dto = new TipoDeudaVehicularDTO();
        dto.setIdTipoDeuda(entity.getIdTipoDeuda());
        dto.setCodigo(entity.getCodigo());
        dto.setNombre(entity.getNombre());
        dto.setDescripcion(entity.getDescripcion());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
