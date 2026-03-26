package org.example.pagamentos.exception;

/**
 * Exceção lançada quando um recurso não é encontrado
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " não encontrado com ID: " + id);
    }
    
    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " não encontrado: " + identifier);
    }
}
