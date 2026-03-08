package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RegistroBaseUnicaVehiculoDTO {

    private Long idRegistroBaseUnica;
    private Long tramiteId;
    private Long vehiculoId;
    private Long registroSriId;
    private Long usuarioId;

    private String tipoOrigen;
    private String documentoOrigen;
    private LocalDate fechaRegistro;
    private String estado;
}
