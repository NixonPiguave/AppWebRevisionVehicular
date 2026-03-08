package com.revisionvehicular.backend.repositories.rtv;

import com.revisionvehicular.backend.entities.rtv.RegistroBaseUnicaVehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IRegistroBaseUnicaVehiculoRepository extends JpaRepository<RegistroBaseUnicaVehiculo, Long> {
}
