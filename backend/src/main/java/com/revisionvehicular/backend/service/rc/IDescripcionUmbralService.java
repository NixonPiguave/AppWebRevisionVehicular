package com.revisionvehicular.backend.service.rc;

import com.revisionvehicular.backend.dtos.rc.DescripcionUmbralDTO;
import java.util.List;

public interface IDescripcionUmbralService {

    DescripcionUmbralDTO save(DescripcionUmbralDTO dto);

    DescripcionUmbralDTO update(Long id, DescripcionUmbralDTO dto);

    DescripcionUmbralDTO findById(Long id);

    List<DescripcionUmbralDTO> findAll();

    void delete(Long id);
}