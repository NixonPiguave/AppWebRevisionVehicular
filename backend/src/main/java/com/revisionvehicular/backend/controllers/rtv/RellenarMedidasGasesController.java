package com.revisionvehicular.backend.controllers.rtv;

import com.revisionvehicular.backend.dtos.rtv.ValoresMedidosGasesDTO;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
@RestController
@RequestMapping("/api/aleatorio")
public class RellenarMedidasGasesController {

    private static final ThreadLocalRandom RAND = ThreadLocalRandom.current();
    @GetMapping("/valoresgases")
    public ValoresMedidosGasesDTO generarValoresGases(
            @RequestParam(defaultValue = "GASOLINA") String tipoCombustible) {

        ValoresMedidosGasesDTO dto = new ValoresMedidosGasesDTO();

        if ("DIESEL".equalsIgnoreCase(tipoCombustible)) {
            double opacidad = redondear(RAND.nextDouble(0, 35), 1);
            dto.setOpacidad(String.valueOf(opacidad));
        } else {
            double co = redondear(RAND.nextDouble(0, 0.11), 2);
            int hc = RAND.nextInt(0, 5001);
            double lambda = redondear(RAND.nextDouble(0, 2.01), 2);
            double o2 = redondear(RAND.nextDouble(0, 2.1), 1);
            dto.setCo(String.valueOf(co));
            dto.setHc(String.valueOf(hc));
            dto.setLambda(String.valueOf(lambda));
            dto.setO2(String.valueOf(o2));
        }

        return dto;
    }

    private static double redondear(double valor, int decimales) {
        double factor = Math.pow(10, decimales);
        return Math.round(valor * factor) / factor;
    }
}
