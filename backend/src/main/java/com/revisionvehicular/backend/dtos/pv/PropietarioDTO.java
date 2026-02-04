package com.revisionvehicular.backend.dtos.pv;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PropietarioDTO {

    private Long idPropietario;

    private String documentoIdentidad;
    private String nombre;
    private Integer telefono;
    private String correo;
    private String direccion;

    private LocalDate fechaRegistro;
}
