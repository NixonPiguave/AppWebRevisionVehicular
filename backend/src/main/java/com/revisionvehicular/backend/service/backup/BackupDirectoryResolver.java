package com.revisionvehicular.backend.service.backup;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;

public final class BackupDirectoryResolver {

    private BackupDirectoryResolver() {
    }

    public static String expandConfigPath(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            return ruta;
        }
        String s = ruta.trim();

        String up = System.getenv("USERPROFILE");
        if (up != null && !up.isBlank()) {
            s = s.replace("%USERPROFILE%", up);
        }
        String hd = System.getenv("HOMEDRIVE");
        String hp = System.getenv("HOMEPATH");
        if (hd != null) {
            s = s.replace("%HOMEDRIVE%", hd);
        }
        if (hp != null) {
            s = s.replace("%HOMEPATH%", hp);
        }

        String jh = System.getProperty("user.home", "");
        if (!jh.isEmpty()) {
            s = s.replace("${user.home}", jh);
        }
        if (!jh.isEmpty() && (s.startsWith("~/") || s.startsWith("~\\"))) {
            s = jh + s.substring(1);
        }

        s = corregirUsersUserDeEjemplo(s);
        return s;
    }

    private static String corregirUsersUserDeEjemplo(String s) {
        String osUser = System.getProperty("user.name");
        if (osUser == null || osUser.isBlank() || "user".equalsIgnoreCase(osUser)) {
            return s;
        }
        String norm = s.replace('/', '\\');
        if (!norm.matches("(?i)^[A-Za-z]:\\\\Users\\\\user(\\\\.*)?$")) {
            return s;
        }
        String fixed = norm.replaceFirst("(?i)^([A-Za-z]:\\\\Users\\\\)user", "$1" + Matcher.quoteReplacement(osUser));
        if (!s.contains("\\") && s.contains("/")) {
            return fixed.replace('\\', '/');
        }
        return fixed;
    }

    /**
     * Normaliza y comprueba que sea absoluta (no solo el nombre de carpeta ni rutas relativas).
     */
    public static Path requireAbsolutePath(String ruta) {
        if (ruta == null || ruta.isBlank()) {
            throw new RuntimeException("La ruta del servidor no puede estar vacía.");
        }
        String expanded = expandConfigPath(ruta);
        Path p = Paths.get(expanded).normalize();
        if (!p.isAbsolute()) {
            throw new RuntimeException(
                    "La ruta de respaldos debe ser absoluta en el equipo donde corre el backend "
                            + "(ej. C:\\Respaldos\\RTV en Windows). No use solo el nombre de carpeta "
                            + "ni rutas relativas; puede usar %USERPROFILE%\\Carpeta o copiar la ruta desde el Explorador.");
        }
        return p;
    }

    /**
     * Garantiza directorio existente y escribible (respaldos pg_dump, credenciales bajo la misma base, etc.).
     */
    public static Path resolveWritableDirectory(String ruta) {
        Path p = requireAbsolutePath(ruta);
        try {
            if (Files.exists(p)) {
                if (!Files.isDirectory(p)) {
                    throw new RuntimeException("La ruta existe pero no es una carpeta: " + p);
                }
            } else {
                Files.createDirectories(p);
            }
            if (!Files.isWritable(p)) {
                throw new RuntimeException("Sin permiso de escritura en el directorio de respaldos: " + p);
            }
            return p.toAbsolutePath().normalize();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException(
                    "No se pudo preparar el directorio de respaldos: " + p + ". "
                            + "Compruebe que la ruta sea correcta (carpeta real en ese PC), que exista o se pueda crear, "
                            + "y que el proceso tenga permisos. Si usó C:\\Users\\user\\... de un ejemplo, sustituya "
                            + "\"user\" por su usuario de Windows o use %USERPROFILE%\\... Detalle: "
                            + e.getClass().getSimpleName() + ": " + e.getMessage(),
                    e);
        }
    }
}
