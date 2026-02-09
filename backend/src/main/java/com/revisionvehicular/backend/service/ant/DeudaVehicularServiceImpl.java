package com.revisionvehicular.backend.service.ant;

import com.revisionvehicular.backend.repositories.ant.IDeudaVehicularRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class DeudaVehicularServiceImpl implements IDeudaVehicularService {

    private final IDeudaVehicularRepository repository;

    public DeudaVehicularServiceImpl(IDeudaVehicularRepository repository) {
        this.repository = repository;
    }

    @Override
    public void insertar(Long idVehiculo,Long idEntidad,String tipoDeuda,Integer periodo,LocalDate fechaVencimiento,BigDecimal montoOriginal,BigDecimal montoRecargo,BigDecimal montoTotal,BigDecimal montoPendiente,String estado,LocalDate fechaGeneracion) {
        repository.insertar(idVehiculo,idEntidad,tipoDeuda,periodo,fechaVencimiento,montoOriginal,montoRecargo,montoTotal,montoPendiente,estado,fechaGeneracion);
    }

    @Override
    public void modificar(Long idDeuda,Long idVehiculo,Long idEntidad,String tipoDeuda,Integer periodo,LocalDate fechaVencimiento,BigDecimal montoOriginal,BigDecimal montoRecargo,BigDecimal montoTotal,BigDecimal montoPendiente,String estado,LocalDate fechaGeneracion) {
        repository.modificar(idDeuda,idVehiculo,idEntidad,tipoDeuda,periodo,fechaVencimiento,montoOriginal,montoRecargo,montoTotal,montoPendiente,estado,fechaGeneracion);
    }
}
