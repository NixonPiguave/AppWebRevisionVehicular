package com.revisionvehicular.backend.dtos.ant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropietarioVistaDTO {

    private Long idPropietario;
    private String documentoIdentidad;
    private String nombre;
    private String telefono;
    private String correo;
    private String direccion;
    private LocalDate fechaRegistro;
}
