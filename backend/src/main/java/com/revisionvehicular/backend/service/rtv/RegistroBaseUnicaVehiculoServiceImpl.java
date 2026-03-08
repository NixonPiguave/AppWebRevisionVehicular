package com.revisionvehicular.backend.service.rtv;

import com.revisionvehicular.backend.dtos.rtv.RegistroBaseUnicaVehiculoDTO;
import com.revisionvehicular.backend.entities.rtv.RegistroBaseUnicaVehiculo;
import com.revisionvehicular.backend.entities.srtv.Usuario;
import com.revisionvehicular.backend.repositories.rtv.IRegistroBaseUnicaVehiculoRepository;
import com.revisionvehicular.backend.repositories.rtv.ITramiteMatriculacionRepository;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.repositories.srtv.IUsuarioRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistroBaseUnicaVehiculoServiceImpl implements IRegistroBaseUnicaVehiculoService {

    private final IRegistroBaseUnicaVehiculoRepository repository;
    private final ITramiteMatriculacionRepository tramiteRepository;
    private final IVehiculoRepository vehiculoRepository;
    private final IUsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public RegistroBaseUnicaVehiculoServiceImpl(IRegistroBaseUnicaVehiculoRepository repository,
                                                 ITramiteMatriculacionRepository tramiteRepository,
                                                 IVehiculoRepository vehiculoRepository,
                                                 IUsuarioRepository usuarioRepository,
                                                 AuditoriaService auditoriaService) {
        this.repository = repository;
        this.tramiteRepository = tramiteRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    private RegistroBaseUnicaVehiculoDTO toDTO(RegistroBaseUnicaVehiculo e) {
        RegistroBaseUnicaVehiculoDTO dto = new RegistroBaseUnicaVehiculoDTO();
        dto.setIdRegistroBaseUnica(e.getIdRegistroBaseUnica());
        dto.setTipoOrigen(e.getTipoOrigen());
        dto.setDocumentoOrigen(e.getDocumentoOrigen());
        dto.setFechaRegistro(e.getFechaRegistro());
        dto.setEstado(e.getEstado());
        if (e.getTramite() != null) dto.setTramiteId(e.getTramite().getIdTramite());
        if (e.getVehiculo() != null) dto.setVehiculoId(e.getVehiculo().getVehiculoid());
        if (e.getRegistroSri() != null) dto.setRegistroSriId(e.getRegistroSri().getIdSriRegistro());
        if (e.getUsuario() != null) dto.setUsuarioId(e.getUsuario().getUsuarioId());
        return dto;
    }

    @Override
    @Transactional
    public RegistroBaseUnicaVehiculoDTO save(RegistroBaseUnicaVehiculoDTO dto) {
        if (dto.getVehiculoId() == null) {
            throw new IllegalArgumentException("El vehículo es obligatorio.");
        }
        Long usuarioId = dto.getUsuarioId();
        if (usuarioId == null) {
            usuarioId = auditoriaService.getUsuarioActual().map(Usuario::getUsuarioId).orElse(null);
        }
        if (usuarioId == null) {
            throw new IllegalArgumentException("No se pudo determinar el usuario. Debe iniciar sesión.");
        }

        RegistroBaseUnicaVehiculo entity = new RegistroBaseUnicaVehiculo();
        entity.setTipoOrigen(dto.getTipoOrigen() != null ? dto.getTipoOrigen() : "NUEVO");
        entity.setDocumentoOrigen(dto.getDocumentoOrigen());
        entity.setFechaRegistro(dto.getFechaRegistro() != null ? dto.getFechaRegistro() : LocalDate.now());
        entity.setEstado(dto.getEstado() != null ? dto.getEstado() : "REGISTRADO");

        if (dto.getTramiteId() != null) {
            entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElse(null));
        }
        entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado")));
        entity.setUsuario(usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado")));
        // registroSri queda null si no se provee repo o ID

        RegistroBaseUnicaVehiculo guardado = repository.save(entity);
        auditoriaService.registrar("INSERT", "RegistroBaseUnicaVehiculo", "Registró vehículo en base única " + guardado.getIdRegistroBaseUnica());
        return toDTO(guardado);
    }

    @Override
    @Transactional
    public RegistroBaseUnicaVehiculoDTO update(Long id, RegistroBaseUnicaVehiculoDTO dto) {
        RegistroBaseUnicaVehiculo entity = repository.findById(id).orElseThrow(() -> new RuntimeException("Registro no encontrado con ID: " + id));
        entity.setTipoOrigen(dto.getTipoOrigen());
        entity.setDocumentoOrigen(dto.getDocumentoOrigen());
        entity.setFechaRegistro(dto.getFechaRegistro());
        entity.setEstado(dto.getEstado());
        if (dto.getTramiteId() != null) entity.setTramite(tramiteRepository.findById(dto.getTramiteId()).orElse(null));
        if (dto.getVehiculoId() != null) entity.setVehiculo(vehiculoRepository.findById(dto.getVehiculoId()).orElse(null));
        RegistroBaseUnicaVehiculo actualizado = repository.save(entity);
        return toDTO(actualizado);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) throw new RuntimeException("Registro no encontrado con ID: " + id);
        repository.deleteById(id);
        auditoriaService.registrar("DELETE", "RegistroBaseUnicaVehiculo", "Eliminó registro " + id);
    }

    @Override
    public RegistroBaseUnicaVehiculoDTO findById(Long id) {
        return toDTO(repository.findById(id).orElseThrow(() -> new RuntimeException("Registro no encontrado con ID: " + id)));
    }

    @Override
    public List<RegistroBaseUnicaVehiculoDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }
}
