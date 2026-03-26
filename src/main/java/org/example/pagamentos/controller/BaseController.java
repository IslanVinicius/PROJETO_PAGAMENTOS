package org.example.pagamentos.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Classe base para todos os controllers do sistema
 * Fornece métodos utilitários para respostas padronizadas
 */
@RestController
public abstract class BaseController {

    /**
     * Cria uma resposta de sucesso padrão
     */
    protected ResponseEntity<Map<String, Object>> successResponse(Object data, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.OK.value());
        response.put("message", message);
        response.put("data", data);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cria uma resposta de sucesso sem dados
     */
    protected ResponseEntity<Map<String, Object>> successResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.OK.value());
        response.put("message", message);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Cria uma resposta de erro padrão
     */
    protected ResponseEntity<Map<String, Object>> errorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("error", status.getReasonPhrase());
        response.put("message", message);
        
        return new ResponseEntity<>(response, status);
    }
}
