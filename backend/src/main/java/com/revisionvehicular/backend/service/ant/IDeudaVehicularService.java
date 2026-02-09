package com.revisionvehicular.backend.service.ant;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface IDeudaVehicularService {

    void insertar(Long idVehiculo,Long idEntidad,String tipoDeuda,Integer periodo,LocalDate fechaVencimiento,BigDecimal montoOriginal,BigDecimal montoRecargo,BigDecimal montoTotal,BigDecimal montoPendiente,String estado,LocalDate fechaGeneracion);

    void modificar(Long idDeuda,Long idVehiculo,Long idEntidad,String tipoDeuda,Integer periodo,LocalDate fechaVencimiento,BigDecimal montoOriginal,BigDecimal montoRecargo,BigDecimal montoTotal,BigDecimal montoPendiente,String estado,LocalDate fechaGeneracion);
}
