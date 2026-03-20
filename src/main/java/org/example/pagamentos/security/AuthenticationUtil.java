package org.example.pagamentos.security;

import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationUtil {

    private final UsuarioRepository usuarioRepository;

    public AuthenticationUtil(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Retorna o usuário autenticado atual
     * @return Usuario do usuário autenticado
     * @throws RuntimeException se nenhum usuário estiver autenticado
     */
    public Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Nenhum usuário autenticado");
        }

        String username = authentication.getName();
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + username));
    }

    /**
     * Verifica se o usuário autenticado é ADMIN
     * @return true se for ADMIN, false caso contrário
     */
    public boolean isAdmin() {
        try {
            Usuario usuario = getUsuarioAutenticado();
            return usuario.getRole().name().equals("ADMIN");
        } catch (RuntimeException e) {
            return false;
        }
    }
}

