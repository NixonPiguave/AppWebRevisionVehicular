package com.revisionvehicular.backend.entities.srtv;

import jakarta.persistence.CascadeType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Data;
import org.hibernate.boot.models.annotations.spi.ColumnDetails;
import org.springframework.data.annotation.Id;

@Data
public class Turnos {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;


}
