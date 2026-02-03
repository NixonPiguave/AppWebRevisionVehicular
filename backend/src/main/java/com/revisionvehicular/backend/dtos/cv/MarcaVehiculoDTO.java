package com.revisionvehicular.backend.dtos.cv;

import java.time.LocalDate;
import java.util.List;

public class MarcaVehiculoDTO {
    private Long id;
    private String nombre;
    private String empresa;
    private String paisOrigen;
    private String grupoAutomotriz;
    private LocalDate fechaAlta;
    private LocalDate fechaBaja;
    private String logoUrl;
    private String estado;

    private List<ModeloVehiculoDTO> modelos;
}
