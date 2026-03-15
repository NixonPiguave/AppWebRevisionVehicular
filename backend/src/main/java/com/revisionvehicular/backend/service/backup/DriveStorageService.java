package com.revisionvehicular.backend.service.backup;

import com.google.api.client.http.FileContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.FileList;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.util.List;

@Service
public class DriveStorageService {

    private Drive buildDriveService(BackupConfig config) throws Exception {
        GoogleCredentials credentials = GoogleCredentials
                .fromStream(new FileInputStream(config.getDriveCredentialsPath()))
                .createScoped(List.of(DriveScopes.DRIVE_FILE));

        return new Drive.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("RTV-BackupSystem")
                .build();
    }

    public String subirArchivo(java.io.File archivo, String nombreArchivo, BackupConfig config) throws Exception {
        Drive drive = buildDriveService(config);

        com.google.api.services.drive.model.File metadata =
                new com.google.api.services.drive.model.File();
        metadata.setName(nombreArchivo);
        metadata.setParents(List.of(config.getDriveFolderId()));

        FileContent contenido = new FileContent("application/octet-stream", archivo);

        com.google.api.services.drive.model.File subido = drive.files()
                .create(metadata, contenido)
                .setFields("id, name, size")
                .execute();

        return subido.getId();
    }

    public boolean verificarConexion(BackupConfig config) {
        try {
            Drive drive = buildDriveService(config);
            FileList result = drive.files().list()
                    .setQ("'" + config.getDriveFolderId() + "' in parents")
                    .setPageSize(1)
                    .execute();
            return result != null;
        } catch (Exception e) {
            return false;
        }
    }
}