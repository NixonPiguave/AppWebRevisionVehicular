package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ICategoriaRepository extends JpaRepository<Categoria,Long> {
    @Procedure(procedureName = "sp_categoria_insertar")
    void spInsertarCategoria(
      @Param("p_codigo") String pcodigo,
      @Param("p_nombre") String pnombre,
      @Param("p_estado") String pestado,
      @Param("p_descripcion") String pdescripcion
    );
    Optional<Categoria> getByNombre(String nombre);
    Optional<Categoria> findById(Long id);

}
