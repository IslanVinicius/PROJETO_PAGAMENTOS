package org.example.pagamentos.controller;

import jakarta.validation.Valid;
import org.example.pagamentos.DTO.EnderecoDTO;
import org.example.pagamentos.DTO.EnderecoRequest;
import org.example.pagamentos.service.EnderecoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/enderecos")
public class EnderecoController {

    private final EnderecoService enderecoService;

    public EnderecoController(EnderecoService enderecoService) {
        this.enderecoService = enderecoService;
    }

    /**
     * GET /api/enderecos - Lista todos os endereços
     */
    @GetMapping
    public ResponseEntity<List<EnderecoDTO>> listarTodos(
            @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("Usuário autenticado: " + userDetails.getUsername());
        return ResponseEntity.ok().body(enderecoService.listarTodos());
    }

    /**
     * GET /api/enderecos/empresa/{idEmpresa} - Lista endereços de uma empresa específica
     */
    @GetMapping("/empresa/{idEmpresa}")
    public ResponseEntity<List<EnderecoDTO>> listarPorEmpresa(
            @PathVariable Long idEmpresa) {
        return ResponseEntity.ok().body(enderecoService.listarPorEmpresa(idEmpresa));
    }

    /**
     * GET /api/enderecos/{id} - Busca um endereço por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<EnderecoDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok().body(enderecoService.buscarPorId(id));
    }

    /**
     * POST /api/enderecos - Cria um novo endereço
     */
    @PostMapping
    public ResponseEntity<EnderecoDTO> salvar(
            @Valid @RequestBody EnderecoRequest enderecoRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(enderecoService.cadastrarEndereco(enderecoRequest));
    }

    /**
     * PUT /api/enderecos/{id} - Atualiza um endereço existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<EnderecoDTO> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody EnderecoRequest enderecoRequest) {
        return ResponseEntity.ok()
                .body(enderecoService.atualizarEndereco(id, enderecoRequest));
    }

    /**
     * DELETE /api/enderecos/{id} - Deleta um endereço
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        enderecoService.deletarEndereco(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/enderecos/ia/{cep}/empresa/{idEmpresa} - 
     * Busca endereço via API de IA e associa à empresa
     * Este endpoint integra com serviço externo para buscar dados do endereço
     */
    @PostMapping("/ia/{cep}/empresa/{idEmpresa}")
    public ResponseEntity<EnderecoDTO> buscarEnderecoViaIA(
            @PathVariable String cep,
            @PathVariable Long idEmpresa) {
        
        System.out.println("Buscando endereço via IA para CEP: " + cep + 
                          " e empresa: " + idEmpresa);
        
        EnderecoDTO enderecoDTO = enderecoService.buscarEnderecoViaIA(cep, idEmpresa);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(enderecoDTO);
    }
}
