package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.TarifarioTramite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ITarifarioTramiteRepository extends JpaRepository<TarifarioTramite, Long> {

    Optional<TarifarioTramite> findByServicio_IdTipoTramiteAndEstadoAndCategoria_Categoriaid(
            Long idTipoTramite, String estado, Long categoriaId);

    Optional<TarifarioTramite> findByServicio_IdTipoTramiteAndEstadoAndCategoriaIsNull(
            Long idTipoTramite, String estado);
}