package com.revisionvehicular.backend.dtos.backup;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderItemDTO {
    private String name;
    private String path;
    private boolean directory;
}
