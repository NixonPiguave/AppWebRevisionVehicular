package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.TramiteMatriculacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ITramiteMatriculacionRepository extends JpaRepository<TramiteMatriculacion, Long> {
}
