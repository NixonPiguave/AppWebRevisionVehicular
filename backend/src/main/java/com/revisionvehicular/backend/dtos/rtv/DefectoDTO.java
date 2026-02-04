package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

@Data
public class DefectoDTO {

    private Long id;
    private String codigo;
    private String descripcion;
    private String gravedad;
    private String estado;

    private Long tipoDefectoId;
    private Long subfamiliaId;
    private Long categoriaId;
}
