package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ImprontaDTO {

    private Long id;
    private LocalDateTime fechaRegistro;
    private String codigoImpronta;
    private String descripcion;
    private String estado;

    private Long vehiculoId;
    private String placa;
    private Long empresaId;
    private Long usuarioId;
}
