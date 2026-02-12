package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.PagoMultaDTO;
import com.revisionvehicular.backend.entities.ant.PagoMulta;
import com.revisionvehicular.backend.repositories.ant.IPagoMultaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PagoMultaServiceImpl implements IPagoMultaService {

    private final IPagoMultaRepository repository;

    public PagoMultaServiceImpl(IPagoMultaRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(PagoMultaDTO dto) {
        repository.spInsertarPagoMulta(
                dto.getIdMulta(),
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
    public void actualizar(Long id, PagoMultaDTO dto) {
        repository.spActualizarPagoMulta(
                id,
                dto.getIdMulta(),
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
    public List<PagoMultaDTO> listar() {
        return repository.findAll().stream().map(this::convertirDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<PagoMultaDTO> buscarPorId(Long id) {
        return repository.findById(id).map(this::convertirDTO);
    }

    private PagoMultaDTO convertirDTO(PagoMulta entity) {
        PagoMultaDTO dto = new PagoMultaDTO();
        dto.setIdPagoMulta(entity.getIdPagoMulta());
        dto.setIdMulta(entity.getMulta().getIdMulta());
        dto.setFechaPago(entity.getFechaPago());
        dto.setMontoOriginal(entity.getMontoOriginal());
        dto.setMontoPagado(entity.getMontoPagado());
        dto.setMontoPendiente(entity.getMontoPendiente());
        dto.setMontoTotal(entity.getMontoTotal());
        dto.setIdMetodoPago(entity.getMetodoPago().getMetodoPagoId());
        dto.setEstado(entity.getEstado());
        return dto;
    }
}
