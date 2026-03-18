package com.revisionvehicular.backend.dtos.srtv;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CertificadoRtvDTO {

    @Data
    public static class EmpresaInfo {
        private String nombre;
        private String direccion;
        private String telefono;
        private String correo;
        private String logoempresa;
        private String ruc;
    }

    @Data
    public static class PruebaInfo {
        private String metodoNombre;
        private String resultado;
        private String observaciones;
        private LocalDateTime fechaInspeccion;
        private String inspectorNombre;
    }

    @Data
    public static class TurnoInfo {
        private String numeroTurno;
        private String placa;
        private String propietarioNombre;
        private String servicioNombre;
        private String fechaInicio;
    }

    private EmpresaInfo empresa = new EmpresaInfo();
    private List<String> inspectores = new ArrayList<>();
    private TurnoInfo turno = new TurnoInfo();
    private List<PruebaInfo> pruebas = new ArrayList<>();
}
