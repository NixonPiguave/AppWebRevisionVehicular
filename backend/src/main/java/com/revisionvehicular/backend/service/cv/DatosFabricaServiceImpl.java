package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.dtos.cv.DatosFabricaDTO;
import com.revisionvehicular.backend.entities.cv.DatosFabrica;
import com.revisionvehicular.backend.repositories.cv.IDatosFabricaRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DatosFabricaServiceImpl implements IDatosFabricaService {

    private final IDatosFabricaRepository repository;

    public DatosFabricaServiceImpl(IDatosFabricaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<DatosFabricaDTO> buscarPorMatricula(String matricula) {
        if (matricula == null || matricula.isBlank()) {
            return Optional.empty();
        }
        return repository.findByMatriculaNormalizada(matricula)
                .map(this::toDTO);
    }

    private DatosFabricaDTO toDTO(DatosFabrica entity) {
        DatosFabricaDTO dto = new DatosFabricaDTO();
        dto.setId(entity.getDatosFabricaId());
        dto.setMatricula(entity.getMatricula());
        dto.setChasis(entity.getChasis());
        dto.setVin(entity.getVin());
        dto.setMarca(entity.getMarca());
        dto.setModelo(entity.getModelo());
        dto.setColor(entity.getColor());
        dto.setAnioFabricacion(entity.getAnioFabricacion());
        return dto;
    }
}
