package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.OpcionMenuDTO;
import com.revisionvehicular.backend.entities.srtv.OpcionMenu;
import com.revisionvehicular.backend.entities.srtv.Rol;
import com.revisionvehicular.backend.entities.srtv.RolOpcionMenu;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.entities.srtv.UsuarioRoles;
import com.revisionvehicular.backend.repositories.srtv.IOpcionMenuRepository;
import com.revisionvehicular.backend.repositories.srtv.IRolOpcionMenuRepository;
import com.revisionvehicular.backend.repositories.srtv.IRolRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRolesRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OpcionMenuServiceImpl implements IOpcionMenuService {

    private final IOpcionMenuRepository opcionMenuRepository;
    private final IRolOpcionMenuRepository rolOpcionMenuRepository;
    private final IUsuarioRolesRepository usuarioRolesRepository;
    private final IRolRepository rolRepository;
    private final AuditoriaService auditoriaService;

    public OpcionMenuServiceImpl(IOpcionMenuRepository opcionMenuRepository,
                                 IRolOpcionMenuRepository rolOpcionMenuRepository,
                                 IUsuarioRolesRepository usuarioRolesRepository,
                                 IRolRepository rolRepository,
                                 AuditoriaService auditoriaService) {
        this.opcionMenuRepository = opcionMenuRepository;
        this.rolOpcionMenuRepository = rolOpcionMenuRepository;
        this.usuarioRolesRepository = usuarioRolesRepository;
        this.rolRepository = rolRepository;
        this.auditoriaService = auditoriaService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OpcionMenuDTO> findAll() {
        return opcionMenuRepository.findAllByOrderByOrdenAscClaveAsc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getOpcionMenuIdsByRolId(Long rolId) {
        return rolOpcionMenuRepository.findByRol_RolId(rolId).stream()
                .map(rom -> rom.getOpcionMenu().getOpcionMenuId())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void setOpcionesMenuForRol(Long rolId, List<Long> opcionMenuIds) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + rolId));
        rolOpcionMenuRepository.deleteByRolId(rolId);
        if (opcionMenuIds != null && !opcionMenuIds.isEmpty()) {
            for (Long opcionMenuId : opcionMenuIds) {
                OpcionMenu opcion = opcionMenuRepository.findById(opcionMenuId).orElse(null);
                if (opcion != null) {
                    RolOpcionMenu rom = new RolOpcionMenu();
                    rom.setRol(rol);
                    rom.setOpcionMenu(opcion);
                    rolOpcionMenuRepository.save(rom);
                }
            }
        }

        int cantidad = opcionMenuIds != null ? opcionMenuIds.size() : 0;
        auditoriaService.registrar(
                "UPDATE",
                "Accesos por rol",
                "Actualizó opciones de menú del rol ID " + rolId + " (opciones: " + cantidad + ")."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getOpcionMenuClavesByUsuario(Usuario usuario) {
        Set<String> claves = new LinkedHashSet<>();
        List<UsuarioRoles> usuarioRoles = usuarioRolesRepository.findByUsuario(usuario);
        if (usuarioRoles == null || usuarioRoles.isEmpty()) return new ArrayList<>(claves);
        for (UsuarioRoles ur : usuarioRoles) {
            if (ur.getRol() == null) continue;
            Long rolId = ur.getRol().getRolId();
            List<RolOpcionMenu> list = rolOpcionMenuRepository.findByRolIdWithOpcionMenu(rolId);
            for (RolOpcionMenu rom : list) {
                if (rom.getOpcionMenu() != null && rom.getOpcionMenu().getClave() != null) {
                    claves.add(rom.getOpcionMenu().getClave());
                }
            }
        }
        return new ArrayList<>(claves);
    }

    private OpcionMenuDTO toDTO(OpcionMenu o) {
        OpcionMenuDTO dto = new OpcionMenuDTO();
        dto.setOpcionMenuId(o.getOpcionMenuId());
        dto.setClave(o.getClave());
        dto.setNombreVisible(o.getNombreVisible());
        dto.setModulo(o.getModulo());
        dto.setOrden(o.getOrden() != null ? o.getOrden() : 0);
        return dto;
    }
}
