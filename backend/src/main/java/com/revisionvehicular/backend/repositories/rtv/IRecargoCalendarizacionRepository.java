package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.RecargoCalendarizacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface IRecargoCalendarizacionRepository extends JpaRepository<RecargoCalendarizacion, Long> {

    @Query("SELECT r FROM RecargoCalendarizacion r WHERE r.clave = :clave AND (r.estado IS NULL OR UPPER(r.estado) = 'ACTIVO')")
    Optional<RecargoCalendarizacion> findByClaveAndActivo(@Param("clave") String clave);
}
