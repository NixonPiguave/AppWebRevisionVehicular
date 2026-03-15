package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.DatosFabrica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IDatosFabricaRepository extends JpaRepository<DatosFabrica, Long> {

    @Query("SELECT d FROM DatosFabrica d WHERE UPPER(TRIM(d.matricula)) = UPPER(TRIM(:matricula)) AND (d.estado = 'A' OR d.estado IS NULL)")
    Optional<DatosFabrica> findByMatriculaNormalizada(@Param("matricula") String matricula);
}
