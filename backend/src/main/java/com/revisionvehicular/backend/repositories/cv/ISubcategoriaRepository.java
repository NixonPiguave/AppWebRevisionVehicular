package com.revisionvehicular.backend.repositories.cv;

import com.revisionvehicular.backend.entities.cv.Subcategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ISubcategoriaRepository extends JpaRepository<Subcategoria, Long> {

    @Procedure(procedureName = "sp_subcategoria_insertar")
    void spInsertarSubcategoria(
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_categoria_id") Long categoriaId,
            @Param("p_estado") String estado
    );

    @Procedure(procedureName = "sp_subcategoria_modificar")
    void spModificarSubcategoria(
            @Param("p_subcategoria_id") Long subcategoriaId,
            @Param("p_codigo") String codigo,
            @Param("p_nombre") String nombre,
            @Param("p_descripcion") String descripcion,
            @Param("p_categoria_id") Long categoriaId,
            @Param("p_estado") String estado
    );

    Optional<Subcategoria> findByCodigo(String codigo);

    //List<Subcategoria> findByCategoriaCategoriaId(Long categoriaId);
}
