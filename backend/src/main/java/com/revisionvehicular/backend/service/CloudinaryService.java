package com.revisionvehicular.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;


     // Subir imagen a Cloudinary
     // @param file Archivo MultipartFile
     // @param folder Carpeta en Cloudinary (ej: "empresas", "vehiculos")
     // @return Map con url, public_id, etc.

    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }

        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "rtv/" + folder,
                        "resource_type", "image"
                )
        );

        return uploadResult;
    }


      //Subir PDF a Cloudinary

    public Map<String, Object> uploadPdf(MultipartFile file, String folder) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("El archivo debe ser un PDF");
        }

        return cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "rtv/" + folder,
                        "resource_type", "raw"  // Para PDFs y otros archivos no-imagen
                )
        );
    }
     // Eliminar archivo de Cloudinary
     // @param publicId El public_id retornado al subir (ej: "rtv/empresas/abc123")

    public Map<String, Object> delete(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}