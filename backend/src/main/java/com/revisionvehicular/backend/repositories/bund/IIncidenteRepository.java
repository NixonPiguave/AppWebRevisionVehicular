package com.revisionvehicular.backend.repositories.bund;

import com.revisionvehicular.backend.entities.bund.Incidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IIncidenteRepository extends JpaRepository<Incidente, Long> {
}
