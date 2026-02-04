package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.CalendarizacionMatriculacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ICalendarizacionRepository extends JpaRepository<CalendarizacionMatriculacion, Long> {

    @Procedure(name = "sp_insertar_calendarizacion_matriculacion")
    void insertarCalendarizacionMatriculacion(
            @Param("p_ultimo_digito_placa") Integer ultimoDigitoPlaca,
            @Param("p_mes") Integer mes,
            @Param("p_tipo") Integer tipo,
            @Param("p_estado") String estado
    );

    @Procedure(name = "sp_actualizar_calendarizacion_matriculacion")
    void actualizarCalendarizacionMatriculacion(
            @Param("p_id_calendarizacion") Long idCalendarizacion,
            @Param("p_ultimo_digito_placa") Integer ultimoDigitoPlaca,
            @Param("p_mes") Integer mes,
            @Param("p_tipo") Integer tipo,
            @Param("p_estado") String estado
    );
}