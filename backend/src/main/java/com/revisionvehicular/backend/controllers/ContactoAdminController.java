package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.dtos.ContactoAdminRequest;
import com.revisionvehicular.backend.service.ContactoAdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contacto-admin")
public class ContactoAdminController {

    private final ContactoAdminService contactoAdminService;

    public ContactoAdminController(ContactoAdminService contactoAdminService) {
        this.contactoAdminService = contactoAdminService;
    }

    @PostMapping
    public ResponseEntity<Void> enviarSolicitud(@Valid @RequestBody ContactoAdminRequest request) {
        contactoAdminService.enviarSolicitud(request);
        return ResponseEntity.ok().build();
    }
}
