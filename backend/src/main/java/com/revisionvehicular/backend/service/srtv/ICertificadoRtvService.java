package com.revisionvehicular.backend.service.srtv;

import com.revisionvehicular.backend.dtos.srtv.CertificadoRtvDTO;

public interface ICertificadoRtvService {
    CertificadoRtvDTO obtenerDatosCertificado(Long turnoId);
}
