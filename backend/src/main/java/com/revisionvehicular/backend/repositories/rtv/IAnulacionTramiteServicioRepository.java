package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.AnulacionTramiteServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAnulacionTramiteServicioRepository extends JpaRepository<AnulacionTramiteServicio, Long> {
}
