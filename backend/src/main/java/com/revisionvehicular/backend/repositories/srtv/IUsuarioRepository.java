package com.revisionvehicular.backend.repositories.srtv;

import com.revisionvehicular.backend.entities.srtv.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;

import java.util.Optional;


public interface IUsuarioRepository extends JpaRepository <Usuario,Long> {
    Optional<Usuario> findByUsuarioId(Long usuarioId);
    Optional<Usuario> findByUsuario(String usuario);
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByApellido(String apellido);
    @Procedure(procedureName = "sp_usuario_insertar")
    void insertarUsuarioConRoles(
            @Param("p_area_id") Long areaId,
            @Param("p_empresa_id") Long empresaId,
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_usuario") String usuario,
            @Param("p_contrasena") String contrasena,
            @Param("p_usuario_base_datos") String usuarioBaseDatos,
            @Param("p_contrasena_base_datos") String contrasenaBaseDatos,
            @Param("p_documento_identidad") String documentoIdentidad,
            @Param("p_email") String email,
            @Param("p_estado") String estado,
            @Param("p_roles_json") String rolesJson
    );
    @Procedure(procedureName = "sp_usuario_actualizar")
    void actualizarUsuarioConRoles(
            @Param("p_usuario_id") Long usuarioId,
            @Param("p_area_id") Long areaId,
            @Param("p_empresa_id") Long empresaId,
            @Param("p_nombre") String nombre,
            @Param("p_apellido") String apellido,
            @Param("p_usuario") String usuario,
            @Param("p_contrasena") String contrasena,
            @Param("p_email") String email,
            @Param("p_documento") String documento,
            @Param("p_estado") String estado,
            @Param("p_roles_json") String rolesJson
    );
}


