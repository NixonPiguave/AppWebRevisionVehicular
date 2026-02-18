package com.revisionvehicular.backend.controllers;

import com.revisionvehicular.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Subir imagen
     * POST /api/upload/image?folder=empresas
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder
    ) {
        try {
            Map<String, Object> result = cloudinaryService.uploadImage(file, folder);

            // Retornar solo lo necesario
            Map<String, String> response = new HashMap<>();
            response.put("url", (String) result.get("secure_url"));
            response.put("publicId", (String) result.get("public_id"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    /**
     * Subir PDF
     */
    @PostMapping("/pdf")
    public ResponseEntity<?> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "documentos") String folder
    ) {
        try {
            Map<String, Object> result = cloudinaryService.uploadPdf(file, folder);

            Map<String, String> response = new HashMap<>();
            response.put("url", (String) result.get("secure_url"));
            response.put("publicId", (String) result.get("public_id"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    /**
     * Eliminar archivo
     * DELETE /api/upload?publicId=rtv/empresas/abc123
     */
    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam("publicId") String publicId) {
        try {
            cloudinaryService.delete(publicId);
            return ResponseEntity.ok(Map.of("message", "Archivo eliminado"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}