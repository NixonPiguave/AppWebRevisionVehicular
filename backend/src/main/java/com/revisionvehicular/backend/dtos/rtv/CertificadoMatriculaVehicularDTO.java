package com.revisionvehicular.backend.dtos.rtv;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CertificadoMatriculaVehicularDTO {

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
        private String placaActual;
        private String placaAnterior;
        private String matriculaVehicular; // identificador único interno
        private String marca;
        private String modelo;
        private Integer anio;
        private String color;
        private String chasis;
        private String motor;
        private String tipoServicio; // PARTICULAR/PUBLICO/ESTATAL (según tipo matrícula)
        private String clase; // si está disponible
    }

    private EmpresaInfo empresa;
    private PropietarioInfo propietario;
    private VehiculoInfo vehiculo;
    private LocalDate fechaEmision;
}

