package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.OpcionMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IOpcionMenuRepository extends JpaRepository<OpcionMenu, Long> {

    List<OpcionMenu> findAllByOrderByOrdenAscClaveAsc();
}
