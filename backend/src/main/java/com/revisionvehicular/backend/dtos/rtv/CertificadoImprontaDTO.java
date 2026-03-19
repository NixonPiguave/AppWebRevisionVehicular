package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CertificadoImprontaDTO {

    @Data
    public static class EmpresaInfo {
        private String nombre;
        private String logoempresa;
    }

    @Data
    public static class PropietarioInfo {
        private String nombre;
        private String documento;
    }

    @Data
    public static class VehiculoInfo {
        private String placa;
        private String marca;
        private String modelo;
        private String color;
        private Integer anio;
        private String chasis;
        private String motor;
        private String centroRtv;
    }

    private EmpresaInfo empresa;
    private PropietarioInfo propietario;
    private VehiculoInfo vehiculo;

    private LocalDate fechaEmision;
    private LocalDateTime fechaRegistroImpronta;
    private String improntaChasisTipo; // FISICA/OCULAR/INACCESIBLE
    private String improntaMotorTipo;  // FISICA/OCULAR/INACCESIBLE
}

