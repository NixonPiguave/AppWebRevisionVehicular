package com.revisionvehicular.backend.dtos.rc;

import lombok.Data;

@Data
public class DescripcionUmbralDTO {

    private Long idDescripcionUmbral;

    private String descripcion;

    private Long idUmbral;

    private String estado;
}
