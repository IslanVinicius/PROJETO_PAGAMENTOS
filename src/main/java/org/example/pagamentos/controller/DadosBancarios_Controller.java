package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.Dados_BancariosDTO;
import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.service.Dados_Bancarios_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/dados-bancarios")
public class DadosBancarios_Controller {

    private final Dados_Bancarios_Service dados_Bancarios_Service;

    public DadosBancarios_Controller(Dados_Bancarios_Service dados_Bancarios_Service) {
        this.dados_Bancarios_Service = dados_Bancarios_Service;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOLICITANTE', 'ESCRITORIO')")
    public ResponseEntity<Dados_BancariosDTO> buscarPorID(@PathVariable Long id){
        return ResponseEntity.ok().body(dados_Bancarios_Service.procurarPorID(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SOLICITANTE', 'ESCRITORIO')")
    public ResponseEntity<List<Dados_BancariosDTO>> buscarTodos(){
        return ResponseEntity.ok().body(dados_Bancarios_Service.procurarTodos());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removerPorID(@PathVariable Long id){
        dados_Bancarios_Service.deletarPorID(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SOLICITANTE', 'ESCRITORIO')")
    public ResponseEntity<Dados_BancariosDTO> cadastrarDados(@RequestBody Dados_BancariosDTO dados){
        return ResponseEntity.status(201)
                .body(dados_Bancarios_Service.cadastrarDados(dados));
    }

    @GetMapping("/prestador/{prestadorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOLICITANTE', 'ESCRITORIO')")
    public ResponseEntity<Dados_BancariosDTO> buscarPorPrestador(@PathVariable Long prestadorId){
        Dados_BancariosModel dados = dados_Bancarios_Service.buscarPorPrestador(prestadorId);
        if (dados != null) {
            return ResponseEntity.ok().body(dados_Bancarios_Service.converterParaDTO(dados));
        }
        return ResponseEntity.notFound().build();
    }
}