package com.revisionvehicular.backend.service.backup;

import com.revisionvehicular.backend.dtos.backup.FolderItemDTO;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Lista carpetas del sistema de archivos del servidor para que el usuario
 * pueda elegir la ruta de almacenamiento de backups de forma visual.
 */
@Service
public class FolderBrowserService {

    /**
     * Si path es null o vacío, devuelve las raíces del sistema (ej. C:\, D:\ en Windows).
     * Si path tiene valor, devuelve las subcarpetas directas de esa ruta.
     * Por seguridad se evita path traversal y se restringe a rutas válidas.
     */
    public List<FolderItemDTO> listarCarpetas(String path) {
        if (path == null || path.isBlank()) {
            return listarRaices();
        }
        return listarSubcarpetas(path);
    }

    private List<FolderItemDTO> listarRaices() {
        File[] roots = File.listRoots();
        if (roots == null) {
            return List.of();
        }
        return Arrays.stream(roots)
                .filter(File::exists)
                .map(f -> new FolderItemDTO(f.getAbsolutePath(), f.getAbsolutePath(), true))
                .collect(Collectors.toList());
    }

    private List<FolderItemDTO> listarSubcarpetas(String path) {
        String normalized = normalizarPath(path);
        File dir = new File(normalized);
        if (!dir.exists() || !dir.isDirectory()) {
            return List.of();
        }
        File[] children = dir.listFiles(File::isDirectory);
        if (children == null) {
            return List.of();
        }
        List<FolderItemDTO> result = new ArrayList<>();
        for (File child : children) {
            String childPath = child.getAbsolutePath();
            result.add(new FolderItemDTO(child.getName(), childPath, true));
        }
        result.sort((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(a.getName(), b.getName()));
        return result;
    }

    private String normalizarPath(String path) {
        if (path == null || path.isBlank()) {
            return path;
        }
        String p = path.replace('/', File.separatorChar).trim();
        try {
            return new File(p).getCanonicalPath();
        } catch (Exception e) {
            return new File(p).getAbsolutePath();
        }
    }
}
