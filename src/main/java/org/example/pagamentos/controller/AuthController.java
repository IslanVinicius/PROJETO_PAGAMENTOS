package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.RegisterRequest;
import org.example.pagamentos.Enums.Role;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.UsuarioRepository;
import org.example.pagamentos.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        try {

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.username(),
                                    request.password()
                            )
                    );

            UserDetails user =
                    (UserDetails) authentication.getPrincipal();

            String token = jwtService.generateToken(user);

            return ResponseEntity.ok(Map.of("token", token));

        } catch (AuthenticationException e) {

            return ResponseEntity
                    .status(401)
                    .body("Usuário ou senha inválidos");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok().body(usuario);
    }

    @GetMapping
    public ResponseEntity<List<?>>  getUsuarios() {
        return ResponseEntity.ok().body(usuarioRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUsuario(@PathVariable Long id, @RequestBody RegisterRequest registerRequest) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuário não encontrado"));

        usuario.setUsername(registerRequest.getUsername());
        usuario.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        usuario.setRole(registerRequest.getRole());
        usuarioRepository.save(usuario);

        return ResponseEntity.ok().body(usuario);
    }


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (usuarioRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body("Usuário já existe");
        }

        Usuario usuario = new Usuario();

        usuario.setUsername(request.getUsername());
        usuario.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        // Se não enviar role, vira USER
        if (request.getRole() == null) {
            usuario.setRole(Role.SOLICITANTE);
        } else {
            usuario.setRole(request.getRole());
        }

        usuarioRepository.save(usuario);

       return ResponseEntity.ok(
                Map.of("mensagem", "Usuário cadastrado com sucesso"));
    }


    record AuthRequest(String username, String password) {}
}