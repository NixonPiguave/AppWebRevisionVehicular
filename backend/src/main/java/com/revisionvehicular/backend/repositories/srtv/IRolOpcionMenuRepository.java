package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.RolOpcionMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IRolOpcionMenuRepository extends JpaRepository<RolOpcionMenu, Long> {

    List<RolOpcionMenu> findByRol_RolId(Long rolId);

    @Query("SELECT rom FROM RolOpcionMenu rom JOIN FETCH rom.opcionMenu WHERE rom.rol.rolId = :rolId")
    List<RolOpcionMenu> findByRolIdWithOpcionMenu(@Param("rolId") Long rolId);

    @Modifying
    @Query("DELETE FROM RolOpcionMenu rom WHERE rom.rol.rolId = :rolId")
    void deleteByRolId(@Param("rolId") Long rolId);
}
