package com.revisionvehicular.backend.repositories.ant;

import com.revisionvehicular.backend.entities.ant.PlacaSecuencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IPlacaSecuenciaRepository extends JpaRepository<PlacaSecuencia, Long> {
    Optional<PlacaSecuencia> findByLetraProvinciaAndTipoServicio(String letraProvincia, String tipoServicio);
}

