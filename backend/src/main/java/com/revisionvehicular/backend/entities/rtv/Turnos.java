package com.revisionvehicular.backend.entities.rtv;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class Turnos {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;


}
