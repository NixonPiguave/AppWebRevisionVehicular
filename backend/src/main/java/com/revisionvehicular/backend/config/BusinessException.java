package com.revisionvehicular.backend.config;

import org.springframework.http.HttpStatus;

/**
 * Excepción para errores de negocio/dominio.
 * El GlobalExceptionHandler la captura y devuelve una respuesta HTTP apropiada.
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
