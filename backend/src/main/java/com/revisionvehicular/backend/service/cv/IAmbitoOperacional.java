package com.revisionvehicular.backend.service.cv;
import com.revisionvehicular.backend.dtos.cv.AmbitoOperacionalDTO;
import java.util.List;

public interface IAmbitoOperacional {
    AmbitoOperacionalDTO save(AmbitoOperacionalDTO categoriaDTO);
    List<AmbitoOperacionalDTO> findAll();
    AmbitoOperacionalDTO update(Long id,AmbitoOperacionalDTO dto);
    void delete(Long id);
    AmbitoOperacionalDTO findById(Long id);
}
