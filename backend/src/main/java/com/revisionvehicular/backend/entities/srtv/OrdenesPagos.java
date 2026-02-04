package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import org.springframework.data.annotation.Id;

@Data
public class OrdenesPagos {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    
}

