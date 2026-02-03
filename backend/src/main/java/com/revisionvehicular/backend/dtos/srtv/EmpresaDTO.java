package com.revisionvehicular.backend.dtos.srtv;
import lombok.Data;
@Data
public class EmpresaDTO {
    private Long empresaId;
    private String nombre;
    private String direccion;
    private String telefono;
    private String correo;
    private String logoempresa;
    private String ruc;
}
