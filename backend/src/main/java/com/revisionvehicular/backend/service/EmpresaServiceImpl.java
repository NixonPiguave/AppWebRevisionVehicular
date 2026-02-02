package com.revisionvehicular.backend.service;

import com.revisionvehicular.backend.dtos.srtv.AreaDTO;
import com.revisionvehicular.backend.dtos.srtv.EmpresaDTO;
import com.revisionvehicular.backend.entities.srtv.Area;
import com.revisionvehicular.backend.entities.srtv.Empresa;
import com.revisionvehicular.backend.repositories.srtv.IEmpresaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmpresaServiceImpl implements IEmpresaService {

    private final IEmpresaRepository repository;
    @Autowired
    public EmpresaServiceImpl(IEmpresaRepository repository) {
        this.repository = repository;
    }
    public EmpresaDTO save(EmpresaDTO dto) {
        repository.insertar(dto.getNombre(), dto.getRuc(), dto.getDireccion(), dto.getTelefono(), dto.getCorreo(), dto.getLogoempresa());
        Empresa empresa=repository.getEmpresaByNombre(dto.getNombre()).orElseThrow(() -> new RuntimeException("Error al crear empresa"));
        return toDTO(empresa);
    }

    @Override
    public List<EmpresaDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).
                collect(Collectors.toList());
    }

//    @Override
//    public EmpresaDTO update(Long id, EmpresaDTO dto) {
//        Empresa empresa = repository.findById(id).orElseThrow(() -> new RuntimeException("Error al encontrar empresa"));
//        empresa.setNombre(dto.getNombre());
//        empresa.setRuc(dto.getRuc());
//        empresa.setDireccion(dto.getDireccion());
//        empresa.setTelefono(dto.getTelefono());
//        empresa.setCorreo(dto.getCorreo());
//        empresa.setLogoempresa(dto.getLogoempresa());
//        Empresa updated=repository.save(empresa);
//        return toDTO(updated);
//    }

    @Override
    public EmpresaDTO update(Long id, EmpresaDTO dto) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Empresa no encontrada con ID: " + id);
        }
        repository.spActualizarEmpresa(
                id,
                dto.getNombre(),
                dto.getRuc(),
                dto.getDireccion(),
                dto.getTelefono(),
                dto.getCorreo(),
                dto.getLogoempresa()
        );
        Empresa EmpresaActualizada = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al recuperar la empresa actualizada"));
        return toDTO(EmpresaActualizada);
    }

    @Override
    public void delete(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
        }
        else
            throw new RuntimeException("Error al eliminar empresa");
    }

    EmpresaDTO toDTO(Empresa empresa) {
        EmpresaDTO dto = new EmpresaDTO();
        dto.setEmpresaId(empresa.getEmpresaId());
        dto.setNombre(empresa.getNombre());
        dto.setRuc(empresa.getRuc());
        dto.setDireccion(empresa.getDireccion());
        dto.setTelefono(empresa.getTelefono());
        dto.setCorreo(empresa.getCorreo());
        dto.setLogoempresa(empresa.getLogoempresa());
        return dto;
    }
}
