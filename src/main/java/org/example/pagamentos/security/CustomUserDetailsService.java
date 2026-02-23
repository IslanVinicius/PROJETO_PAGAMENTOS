package org.example.pagamentos.security;

import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(usuario.getUsername())
                .password(usuario.getPassword())
                .roles(usuario.getRole().name()) // depois você pode colocar roles dinâmicas
                .build();
    }
}