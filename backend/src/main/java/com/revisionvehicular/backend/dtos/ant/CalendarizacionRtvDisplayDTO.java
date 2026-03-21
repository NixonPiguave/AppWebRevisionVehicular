package com.revisionvehicular.backend.dtos.ant;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarizacionRtvDisplayDTO {

    private Integer digito;
    private Integer mesObligatorio;
    private String mesNombre;
    private String opcionales;
}
