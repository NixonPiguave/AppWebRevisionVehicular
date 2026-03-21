package com.revisionvehicular.backend.service.backup;

import com.google.api.client.http.FileContent;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.DriveScopes;
import com.google.api.services.drive.model.FileList;
import com.google.api.services.drive.model.File;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import com.revisionvehicular.backend.entities.backup.BackupConfig;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

@Service
public class DriveStorageService {

    private Drive buildDriveService(BackupConfig config) throws Exception {
        if (config == null) throw new RuntimeException("config nula");
        if (config.getDriveCredentialsPath() == null || config.getDriveCredentialsPath().isBlank()) {
            throw new RuntimeException("driveCredentialsPath no configurado");
        }

        String json = Files.readString(Paths.get(config.getDriveCredentialsPath()), StandardCharsets.UTF_8);
        boolean serviceAccount = json.contains("\"type\"") && json.contains("service_account");
        return serviceAccount
                ? buildDriveServiceServiceAccount(config)
                : buildDriveServiceOAuth(config);
    }

    private Drive buildDriveServiceServiceAccount(BackupConfig config) throws Exception {
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

    private GoogleAuthorizationCodeFlow buildOAuthFlow(BackupConfig config) throws Exception {
        String tokenDir = BackupDirectoryResolver.requireAbsolutePath(config.getRutaServidor().trim())
                .resolve("drive-oauth-tokens").toString();
        FileDataStoreFactory dataStoreFactory = new FileDataStoreFactory(new java.io.File(tokenDir));

        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(
                GsonFactory.getDefaultInstance(),
                new InputStreamReader(new FileInputStream(config.getDriveCredentialsPath()), StandardCharsets.UTF_8));

        return new GoogleAuthorizationCodeFlow.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                clientSecrets,
                List.of(DriveScopes.DRIVE))
                .setAccessType("offline")
                .setApprovalPrompt("force")
                .setDataStoreFactory(dataStoreFactory)
                .build();
    }

    private Drive buildDriveServiceOAuth(BackupConfig config) throws Exception {
        GoogleAuthorizationCodeFlow flow = buildOAuthFlow(config);
        Credential credential = flow.loadCredential("default");
        if (credential == null) {
            throw new RuntimeException("Drive OAuth no autorizado. Abra la pantalla y autorice el acceso (OAuth).");
        }

        return new Drive.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance(),
                credential)
                .setApplicationName("RTV-BackupSystem")
                .build();
    }

    public String obtenerDriveOAuthUrl(BackupConfig config, String redirectUri) throws Exception {
        GoogleAuthorizationCodeFlow flow = buildOAuthFlow(config);
        return flow.newAuthorizationUrl()
                .setRedirectUri(redirectUri)
                .build();
    }

    public void guardarDriveOAuthTokens(BackupConfig config, String code, String redirectUri) throws Exception {
        GoogleAuthorizationCodeFlow flow = buildOAuthFlow(config);
        TokenResponse tokenResponse = flow.newTokenRequest(code)
                .setRedirectUri(redirectUri)
                .execute();
        flow.createAndStoreCredential(tokenResponse, "default");
    }

    public String subirArchivo(java.io.File archivo, String nombreArchivo, BackupConfig config) throws Exception {
        return subirArchivo(archivo, nombreArchivo, config, false);
    }

    /**
     * Si {@code reemplazarSiExisteMismoNombre}, busca en la carpeta un archivo con el mismo nombre y
     * sustituye su contenido; si no existe, crea uno nuevo. Evita acumular copias del respaldo incremental rotativo.
     */
    public String subirArchivo(java.io.File archivo, String nombreArchivo, BackupConfig config,
            boolean reemplazarSiExisteMismoNombre) throws Exception {
        Drive drive = buildDriveService(config);
        FileContent contenido = new FileContent("application/octet-stream", archivo);

        if (reemplazarSiExisteMismoNombre) {
            String q = String.format(
                    "name = '%s' and '%s' in parents and trashed = false",
                    escapeDriveQueryLiteral(nombreArchivo),
                    escapeDriveQueryLiteral(config.getDriveFolderId()));
            FileList existentes = drive.files().list()
                    .setQ(q)
                    .setSpaces("drive")
                    .setFields("files(id)")
                    .setPageSize(10)
                    .execute();
            List<File> lista = existentes.getFiles();
            if (lista != null && !lista.isEmpty()) {
                String fileId = lista.get(0).getId();
                File metadata = new File();
                drive.files()
                        .update(fileId, metadata, contenido)
                        .setFields("id, name, size")
                        .execute();
                return fileId;
            }
        }

        File metadata = new File();
        metadata.setName(nombreArchivo);
        metadata.setParents(List.of(config.getDriveFolderId()));

        File subido = drive.files()
                .create(metadata, contenido)
                .setFields("id, name, size")
                .execute();

        return subido.getId();
    }

    private static String escapeDriveQueryLiteral(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("'", "\\'");
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

    /**
     * Elimina archivos antiguos de respaldo en Drive dentro de la carpeta configurada,
     * excepto los que estén en {@code nombresRolling}. Útil cuando se agota la cuota.
     */
    public void eliminarBackupsNoRolling(BackupConfig config, Set<String> nombresRolling) throws Exception {
        if (config == null || config.getDriveFolderId() == null || config.getDriveFolderId().isBlank()) {
            return;
        }

        Drive drive = buildDriveService(config);

        // Borramos todo en la carpeta con nombre que parezca de backup .backup, exceptuando los rolling.
        StringBuilder q = new StringBuilder();
        q.append("'").append(config.getDriveFolderId()).append("' in parents")
                .append(" and trashed = false")
                .append(" and name contains 'backup_'")
                .append(" and name contains '.backup'");

        if (nombresRolling != null && !nombresRolling.isEmpty()) {
            for (String rolling : nombresRolling) {
                if (rolling == null || rolling.isBlank()) continue;
                q.append(" and name != '").append(rolling.replace("'", "\\'")).append("'");
            }
        }

        FileList lista = drive.files().list()
                .setQ(q.toString())
                .setFields("files(id,name)")
                .setPageSize(100)
                .execute();

        List<File> files = lista.getFiles();
        if (files == null || files.isEmpty()) return;

        for (File f : files) {
            if (f.getId() == null) continue;
            drive.files().delete(f.getId()).execute();
        }
    }

    /**
     * Elimina TODOS los archivos de respaldo dentro de la carpeta configurada.
     * Se usa cuando se agota la cuota para recuperar espacio rápidamente.
     */
    public void eliminarTodosBackups(BackupConfig config) throws Exception {
        if (config == null || config.getDriveFolderId() == null || config.getDriveFolderId().isBlank()) {
            return;
        }

        Drive drive = buildDriveService(config);
        FileList lista = drive.files().list()
                .setQ("'" + config.getDriveFolderId() + "' in parents and trashed = false"
                        + " and name contains 'backup_'" 
                        + " and name contains '.backup'")
                .setFields("files(id,name)")
                .setPageSize(100)
                .execute();

        List<File> files = lista.getFiles();
        if (files == null || files.isEmpty()) return;

        for (File f : files) {
            if (f.getId() == null) continue;
            drive.files().delete(f.getId()).execute();
        }
    }
}