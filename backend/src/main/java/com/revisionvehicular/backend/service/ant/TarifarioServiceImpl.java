package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.dtos.ant.TarifarioDTO;
import com.revisionvehicular.backend.entities.ant.Tarifario;
import com.revisionvehicular.backend.repositories.ant.ITarifarioRepository;
import com.revisionvehicular.backend.service.ant.ITarifarioService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TarifarioServiceImpl implements ITarifarioService {

    private final ITarifarioRepository repository;

    public TarifarioServiceImpl(ITarifarioRepository repository) {
        this.repository = repository;
    }

    @Override
    public void crear(TarifarioDTO dto) {
        repository.insertar(
                dto.getValor().doubleValue(),
                dto.getEstado(),
                dto.getIdCategoria()
        );
    }

    @Override
    public void actualizar(Long id, TarifarioDTO dto) {
        repository.actualizar(
                id,
                dto.getValor().doubleValue(),
                dto.getEstado(),
                dto.getIdCategoria()
        );
    }

    @Override
    public List<TarifarioDTO> listar() {
        return repository.findAll()
                .stream()
                .map(this::convertirDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TarifarioDTO> buscarPorId(Long id) {
        return repository.findById(id)
                .map(this::convertirDTO);
    }

    private TarifarioDTO convertirDTO(Tarifario entity) {
        TarifarioDTO dto = new TarifarioDTO();
        dto.setIdTarifario(entity.getIdTarifario());
        dto.setValor(entity.getValor());
        dto.setEstado(entity.getEstado());
        dto.setIdCategoria(entity.getCategoria().getCategoriaid());
        return dto;
    }
}
