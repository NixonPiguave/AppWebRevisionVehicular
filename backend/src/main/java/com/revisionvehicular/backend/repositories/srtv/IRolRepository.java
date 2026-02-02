package com.revisionvehicular.backend.repositories.srtv;
import com.revisionvehicular.backend.entities.srtv.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IRolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> getRolByRolId(Long rolId);
    Optional<Rol> getRolByNombre( String nombre);
    Optional<Rol> getRolByEstado( String estado);
    @Procedure(procedureName = "sp_rol_insertar")
    void spInsertarRol(
            @Param("p_nombre") String pnombre,
            @Param("p_estado") String pestado
    );
    @Procedure(procedureName = "sp_rol_actualizar")
    void spActualizarRol(
            @Param("p_rol_id") Long rolId,
            @Param("p_nombre") String pnombre,
            @Param("p_estado") String pestado
    );
}
