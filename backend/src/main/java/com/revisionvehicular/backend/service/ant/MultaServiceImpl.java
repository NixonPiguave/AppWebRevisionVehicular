package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.MultaDTO;
import com.revisionvehicular.backend.entities.ant.Multa;
import com.revisionvehicular.backend.repositories.ant.IMultaRepository;
import com.revisionvehicular.backend.service.ant.IMultaService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MultaServiceImpl implements IMultaService {

    private final IMultaRepository repository;

    public MultaServiceImpl(IMultaRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(MultaDTO dto) {
        repository.insertar(
                dto.getIdEntidadTransito(),
                dto.getIdPropietario(),
                dto.getIdVehiculo(),
                dto.getIdEstadoMulta(),
                dto.getNumeroCitacion(),
                dto.getFechaEmision(),
                dto.getFechaNotificacion(),
                dto.getPais(),
                dto.getCiudad(),
                dto.getPuntos(),
                dto.getMotivo(),
                dto.getMonto(),
                dto.getEstado()
        );
    }

    @Override
    public void actualizar(Long id, MultaDTO dto) {
        repository.actualizar(
                id,
                dto.getIdEntidadTransito(),
                dto.getIdPropietario(),
                dto.getIdVehiculo(),
                dto.getIdEstadoMulta(),
                dto.getNumeroCitacion(),
                dto.getFechaEmision(),
                dto.getFechaNotificacion(),
                dto.getPais(),
                dto.getCiudad(),
                dto.getPuntos(),
                dto.getMotivo(),
                dto.getMonto(),
                dto.getEstado()
        );
    }

    @Override
    public List<MultaDTO> listar() {
        return repository.findAll().stream().map(m -> {
            MultaDTO dto = new MultaDTO();
            dto.setIdMulta(m.getIdMulta());
            dto.setNumeroCitacion(m.getNumeroCitacion());
            dto.setFechaEmision(m.getFechaEmision());
            dto.setFechaNotificacion(m.getFechaNotificacion());
            dto.setPais(m.getPais());
            dto.setCiudad(m.getCiudad());
            dto.setPuntos(m.getPuntos());
            dto.setMotivo(m.getMotivo());
            dto.setMonto(m.getMonto());
            dto.setEstado(m.getEstado());
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Optional<MultaDTO> buscarPorId(Long id) {
        return repository.findById(id).map(m -> {
            MultaDTO dto = new MultaDTO();
            dto.setIdMulta(m.getIdMulta());
            dto.setNumeroCitacion(m.getNumeroCitacion());
            dto.setFechaEmision(m.getFechaEmision());
            dto.setFechaNotificacion(m.getFechaNotificacion());
            dto.setPais(m.getPais());
            dto.setCiudad(m.getCiudad());
            dto.setPuntos(m.getPuntos());
            dto.setMotivo(m.getMotivo());
            dto.setMonto(m.getMonto());
            dto.setEstado(m.getEstado());
            return dto;
        });
    }
}
