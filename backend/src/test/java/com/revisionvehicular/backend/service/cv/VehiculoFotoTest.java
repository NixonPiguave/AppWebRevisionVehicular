package com.revisionvehicular.backend.service.cv;

import com.revisionvehicular.backend.entities.cv.Vehiculo;
import com.revisionvehicular.backend.repositories.cv.IVehiculoRepository;
import com.revisionvehicular.backend.service.srtv.AuditoriaService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VehiculoFotoTest {
    @Test
    void updatesOnlyPhotoAndReturnsItInVehicleDTO() {
        var repository = mock(IVehiculoRepository.class);
        var audit = mock(AuditoriaService.class);
        var vehicle = new Vehiculo();
        vehicle.setVehiculoid(20L);
        vehicle.setMatricula("GUC-9001");
        when(repository.findById(20L)).thenReturn(Optional.of(vehicle));
        when(repository.save(vehicle)).thenReturn(vehicle);
        var service = new VehiculoServiceImpl(repository, audit);
        var dto = service.actualizarFoto(20L, "https://example.com/vehicle.jpg");
        assertEquals("https://example.com/vehicle.jpg", dto.getFotoUrl());
        assertEquals("GUC-9001", dto.getMatricula());
        verify(repository).save(vehicle);
        verify(audit).registrar(eq("UPDATE"), eq("Vehiculo"), contains("20"));
    }

    @Test
    void rejectsMissingVehiclesWithoutPersistingAnything() {
        var repository = mock(IVehiculoRepository.class);
        when(repository.findById(99L)).thenReturn(Optional.empty());
        var service = new VehiculoServiceImpl(repository, mock(AuditoriaService.class));
        assertThrows(EntityNotFoundException.class, () -> service.actualizarFoto(99L, "https://example.com/photo.jpg"));
        verify(repository, never()).save(any());
    }
}
