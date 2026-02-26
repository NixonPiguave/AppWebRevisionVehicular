package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

@Data
public class ServicioDTO {

    private Long idTipoTramite;
    private String nombre;
    private String descripcion;
    private String requiereRevision;
    private Boolean generaMulta;

    private String estado;
}
