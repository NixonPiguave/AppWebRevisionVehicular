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

    @Data
    public static class DefectoCertificadoInfo {
        private String codigo;
        private String descripcion;
        private String tipo;
    }

    @Data
    public static class PruebaMecatronicaInfo {
        private String codigo;
        private String descripcionPrueba;
        private String unidad;
        private String valor;
        private String limites;
        private String calificacion;
        private String ubicacion;
    }

    @Data
    public static class VehiculoInfo {
        private String placa;
        private String marca;
        private String modelo;
        private Integer anio;
        private String chasis;
        private String motor;
        private String vin;
    }

    @Data
    public static class LineaInfo {
        private String codigo;
        private String descripcion;
    }

    @Data
    public static class EquipoUtilizadoInfo {
        private String nombre;
        private String modelo;
        private String serial;
        private String codigoInterno;
    }

    private EmpresaInfo empresa = new EmpresaInfo();
    private List<String> inspectores = new ArrayList<>();
    private TurnoInfo turno = new TurnoInfo();
    private List<PruebaInfo> pruebas = new ArrayList<>();
    private List<DefectoCertificadoInfo> defectos = new ArrayList<>();
    private Integer totalTipo1 = 0;
    private Integer totalTipo2 = 0;
    private Integer totalTipo3 = 0;
    private String resultadoFinal = "PENDIENTE";
    private VehiculoInfo vehiculo = new VehiculoInfo();
    private List<PruebaMecatronicaInfo> pruebasMecatronicas = new ArrayList<>();
    private String fechaEmision;
    private String validoHasta;
    private Integer kilometraje;
    private String numeroRevision;
    private LineaInfo linea = new LineaInfo();
    private List<EquipoUtilizadoInfo> equiposUtilizados = new ArrayList<>();
}
