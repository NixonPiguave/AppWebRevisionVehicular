package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IEmpresaRepository extends JpaRepository<Empresa, Long>
{
    Optional<Empresa> findById(Long aLong);
    Optional<Empresa> getEmpresaByNombre(String pnombre);
    @Procedure(procedureName = "sp_empresa_insertar")
    void insertar(
            @Param("p_nombre") String pnombre,
            @Param("p_ruc") String pruc,
            @Param("p_direccion") String pdireccion,
            @Param("p_telefono") String ptelefono,
            @Param("p_correo") String pcorreo,
            @Param("p_logoempresa") String plogoempresa
    );
    @Procedure(procedureName = "sp_empresa_actualizar")
    void spActualizarEmpresa(
            @Param("p_empresa_id") Long EmpresaId,
            @Param("p_nombre") String pnombre,
            @Param("p_ruc") String pruc,
            @Param("p_direccion") String pdireccion,
            @Param("p_telefono") String ptelefono,
            @Param("p_correo") String pcorreo,
            @Param("p_logoempresa") String plogoempresa
    );

}
