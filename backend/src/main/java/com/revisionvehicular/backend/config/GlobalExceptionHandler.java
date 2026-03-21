package com.revisionvehicular.backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Manejador global de excepciones para toda la API REST.
 * Centraliza el control de errores y devuelve respuestas consistentes.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Errores de validación Bean Validation (@Valid).
     * Se invoca cuando un @RequestBody no cumple las restricciones.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        String mensaje = errores.values().stream().collect(Collectors.joining("; "));
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Error de validación", mensaje, errores);
    }

    /**
     * Parámetros de path o query con tipo incorrecto (ej: id="abc" en lugar de número).
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String mensaje = String.format("Parámetro '%s' tiene un valor inválido: %s", ex.getName(), ex.getValue());
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Parámetro inválido", mensaje, null);
    }

    /**
     * Excepciones de negocio (reglas de dominio).
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
        return buildErrorResponse(
                ex.getStatus() != null ? ex.getStatus() : HttpStatus.BAD_REQUEST,
                "Error de negocio",
                ex.getMessage(),
                null
        );
    }

    /**
     * JSON malformado o tipo incorrecto en el body.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String mensaje = "El cuerpo de la petición no es válido. Verifique el formato JSON.";
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Petición inválida", mensaje, null);
    }

    /**
     * IllegalArgumentException (validaciones manuales).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Datos inválidos", ex.getMessage(), null);
    }

    /**
     * Cualquier otra excepción no controlada.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        String mensaje = "Error interno del servidor. Por favor intente más tarde.";
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno", mensaje, null);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String tipo,
            String mensaje,
            Map<String, String> detalles
    ) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", mensaje);
        body.put("error", tipo);
        if (detalles != null && !detalles.isEmpty()) {
            body.put("errors", detalles);
        }
        return ResponseEntity.status(status).body(body);
    }
}
