package com.revisionvehicular.backend.dto.srtv;

import lombok.Data;

@Data
public class ServicioDTO {

    private Long idTipoTramite;
    private String nombre;
    private String descripcion;

    private Boolean requiereRevision;
    private Boolean generaMulta;

    private String estado;
}
