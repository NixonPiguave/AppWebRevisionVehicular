package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.RolDTO;
import com.revisionvehicular.backend.dtos.srtv.UsuarioDTO;
import com.revisionvehicular.backend.entities.srtv.UsuarioRoles;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRolesRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioServiceImpl implements IUsuarioService {

    private final IUsuarioRepository repository;
    private final IUsuarioRolesRepository usuarioRolesRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioServiceImpl(IUsuarioRepository repository,
                              IUsuarioRolesRepository usuarioRolesRepository) {
        this.repository = repository;
        this.usuarioRolesRepository = usuarioRolesRepository;
    }
    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsuarioId(usuario.getUsuarioId());
        dto.setNombre(usuario.getNombre());
        dto.setApellido(usuario.getApellido());
        dto.setUsuario(usuario.getUsuario());
        dto.setContrasena(usuario.getContrasena());
        dto.setUsuarioBaseDatos(usuario.getUsuarioBaseDatos());
        dto.setContrasenaBaseDatos(usuario.getContrasenaBaseDatos());
        dto.setDocumentoIdentidad(usuario.getDocumentoIdentidad());
        dto.setEmail(usuario.getEmail());
        dto.setEstado(usuario.getEstado());
        dto.setAreaId(usuario.getArea().getAreaId());
        dto.setEmpresaId(usuario.getEmpresa().getEmpresaId());

        List<UsuarioRoles> usuarioRoles = usuarioRolesRepository.findByUsuario(usuario);
        List<RolDTO> roles = usuarioRoles.stream()
                .map(ur -> {
                    RolDTO rolDTO = new RolDTO();
                    rolDTO.setRolId(ur.getRol().getRolId());
                    rolDTO.setNombre(ur.getRol().getNombre());
                    rolDTO.setEstado(ur.getRol().getEstado());
                    return rolDTO;
                })
                .collect(Collectors.toList());
        dto.setRoles(roles);
        List<Long> rolesIds = usuarioRoles.stream()
                .map(ur -> ur.getRol().getRolId())
                .collect(Collectors.toList());
        dto.setRolesIds(rolesIds);
        return dto;
    }

    private String construirRolesJson(List<Long> rolesIds) {
        if (rolesIds == null || rolesIds.isEmpty()) {
            return "[]";
        }
        return rolesIds.toString();
    }

    @Override
    public UsuarioDTO findById(Long id) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return toDTO(usuario);
    }

    @Override
    public UsuarioDTO findByUsername(String username) {
        Usuario usuario = repository.findByUsuario(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return toDTO(usuario);
    }

    @Override
    public UsuarioDTO findByApellido(String apellido) {
        Usuario usuario = repository.findByApellido(apellido)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return toDTO(usuario);
    }

    @Override
    public List<UsuarioDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UsuarioDTO save(UsuarioDTO dto) {
        String rolesJson = construirRolesJson(dto.getRolesIds());
        String contrasenaApp = passwordEncoder.encode(dto.getContrasena());
        String contrasenaDB = passwordEncoder.encode(generarContrasenaDB(dto.getUsuario()));
        String usuarioDB = "usr_" + dto.getUsuario().toLowerCase();

        repository.insertarUsuarioConRoles(
                dto.getAreaId(),
                dto.getEmpresaId(),
                dto.getNombre(),
                dto.getApellido(),
                dto.getUsuario(),
                contrasenaApp,
                usuarioDB,
                contrasenaDB,
                dto.getDocumentoIdentidad(),
                dto.getEmail(),
                dto.getEstado(),
                rolesJson
        );

        Usuario usuario = repository.findByUsuario(dto.getUsuario())
                .orElseThrow(() -> new RuntimeException("Error al crear usuario"));
        return toDTO(usuario);
    }
    @Override
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Usuario con el id: " + id + " no encontrado");
        }
        String rolesJson = construirRolesJson(dto.getRolesIds());
        repository.actualizarUsuarioConRoles(
                id,
                dto.getAreaId(),
                dto.getEmpresaId(),
                dto.getNombre(),
                dto.getApellido(),
                dto.getUsuario(),
                dto.getContrasena(),
                dto.getEmail(),
                dto.getDocumentoIdentidad(),
                dto.getEstado(),
                rolesJson
        );
        return findById(id);
    }
    @Override
    public void delete(Long id) {
        if (repository.existsById(id))
            repository.deleteById(id);
        else
            throw new RuntimeException("No existe el usuario con el id " + id);
    }
    public String generarContrasenaDB(String usuario) {
        SecureRandom random = new SecureRandom();
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
        StringBuilder sufijo = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            sufijo.append(chars.charAt(random.nextInt(chars.length())));
        }
        return usuario.toLowerCase() + "_" + sufijo.toString();
    }
}