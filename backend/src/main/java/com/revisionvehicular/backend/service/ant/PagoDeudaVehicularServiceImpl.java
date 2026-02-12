package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.PagoDeudaVehicularDTO;
import com.revisionvehicular.backend.entities.ant.PagoDeudaVehicular;
import com.revisionvehicular.backend.repositories.ant.IPagoDeudaVehicularRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PagoDeudaVehicularServiceImpl implements IPagoDeudaVehicularService {

    private final IPagoDeudaVehicularRepository repository;

    public PagoDeudaVehicularServiceImpl(IPagoDeudaVehicularRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(PagoDeudaVehicularDTO dto) {
        repository.insertar(
                dto.getIdDeudaVehicular(),
                dto.getFechaPago(),
                dto.getMontoOriginal(),
                dto.getMontoPagado(),
                dto.getMontoPendiente(),
                dto.getIdMetodoPago(),
                dto.getMontoTotal(),
                dto.getEstado()
        );
    }

    @Override
    public void actualizar(Long id, PagoDeudaVehicularDTO dto) {
        repository.actualizar(
                id,
                dto.getIdDeudaVehicular(),
                dto.getFechaPago(),
                dto.getMontoOriginal(),
                dto.getMontoPagado(),
                dto.getMontoPendiente(),
                dto.getIdMetodoPago(),
                dto.getMontoTotal(),
                dto.getEstado()
        );
    }

    @Override
    public List<PagoDeudaVehicularDTO> listar() {
        return repository.findAll().stream().map(this::convertirDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<PagoDeudaVehicularDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertirDTO);
    }

    private PagoDeudaVehicularDTO convertirDTO(PagoDeudaVehicular entity) {
        PagoDeudaVehicularDTO dto = new PagoDeudaVehicularDTO();
        dto.setIdPagoDeuda(entity.getIdPagoDeuda());
        dto.setIdDeudaVehicular(entity.getDeudaVehicular().getIdDeuda());
        dto.setFechaPago(entity.getFechaPago());
        dto.setMontoOriginal(entity.getMontoOriginal());
        dto.setMontoPagado(entity.getMontoPagado());
        dto.setMontoPendiente(entity.getMontoPendiente());
        dto.setMontoTotal(entity.getMontoTotal());
        dto.setIdMetodoPago(entity.getMetodoPago().getMetodoPagoId());
        dto.setNombreMetodoPago(entity.getMetodoPago().getNombre());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
