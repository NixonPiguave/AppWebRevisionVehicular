package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.DeudaVehicularDTO;
import com.revisionvehicular.backend.entities.ant.DeudaVehicular;
import com.revisionvehicular.backend.repositories.ant.IDeudaVehicularRepository;
import com.revisionvehicular.backend.service.ant.IDeudaVehicularService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DeudaVehicularServiceImpl implements IDeudaVehicularService {

    private final IDeudaVehicularRepository repository;

    public DeudaVehicularServiceImpl(IDeudaVehicularRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(DeudaVehicularDTO dto) {
        repository.insertar(
                dto.getIdVehiculo(),
                dto.getIdEntidadTransito(),
                null, // aquí deberías mapear el idTipoDeuda si lo agregas al DTO
                dto.getPeriodo(),
                dto.getFechaVencimiento(),
                dto.getMontoOriginal(),
                dto.getMontoRecargo(),
                dto.getMontoTotal(),
                dto.getMontoPendiente(),
                dto.getEstado(),
                dto.getFechaGeneracion()
        );
    }

    @Override
    public void actualizar(Long id, DeudaVehicularDTO dto) {
        repository.actualizar(
                id,
                dto.getIdVehiculo(),
                dto.getIdEntidadTransito(),
                null,
                dto.getPeriodo(),
                dto.getFechaVencimiento(),
                dto.getMontoOriginal(),
                dto.getMontoRecargo(),
                dto.getMontoTotal(),
                dto.getMontoPendiente(),
                dto.getEstado(),
                dto.getFechaGeneracion()
        );
    }

    @Override
    public List<DeudaVehicularDTO> listar() {
        return repository.findAll().stream().map(this::convertirDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<DeudaVehicularDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertirDTO);
    }

    private DeudaVehicularDTO convertirDTO(DeudaVehicular entity) {
        DeudaVehicularDTO dto = new DeudaVehicularDTO();
        dto.setIdDeuda(entity.getIdDeuda());
        dto.setIdVehiculo(entity.getVehiculo().getVehiculoid());
        dto.setIdEntidadTransito(entity.getEntidadesTransito().getIdEntidad());
        dto.setPeriodo(entity.getPeriodo());
        dto.setFechaVencimiento(entity.getFechaVencimiento());
        dto.setMontoOriginal(entity.getMontoOriginal());
        dto.setMontoRecargo(entity.getMontoRecargo());
        dto.setMontoTotal(entity.getMontoTotal());
        dto.setMontoPendiente(entity.getMontoPendiente());
        dto.setEstado(entity.getEstado());
        dto.setFechaGeneracion(entity.getFechaGeneracion());
        return dto;
    }
}
