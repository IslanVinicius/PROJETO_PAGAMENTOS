package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.SolicitacaoAprovacaoDTO;
import org.example.pagamentos.service.SolicitacaoAprovacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitacao-aprovacao")
public class SolicitacaoAprovacaoController {

    private final SolicitacaoAprovacaoService solicitacaoAprovacaoService;

    public SolicitacaoAprovacaoController(SolicitacaoAprovacaoService solicitacaoAprovacaoService) {
        this.solicitacaoAprovacaoService = solicitacaoAprovacaoService;
    }

    @GetMapping
    public ResponseEntity<List<SolicitacaoAprovacaoDTO>> buscarTodos() {
        return ResponseEntity.ok().body(solicitacaoAprovacaoService.procurarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoAprovacaoDTO> buscarPorId(@PathVariable Long id){
        return ResponseEntity.ok().body(solicitacaoAprovacaoService.procurarPorID(id));
    }

    @PostMapping
    public ResponseEntity<SolicitacaoAprovacaoDTO>  salvar(@RequestBody SolicitacaoAprovacaoDTO dto){
        return ResponseEntity.status(201).body(solicitacaoAprovacaoService.salvar(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPorId(@PathVariable Long id){
        solicitacaoAprovacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<SolicitacaoAprovacaoDTO> atualizar(@PathVariable Long id, @RequestBody SolicitacaoAprovacaoDTO dto){
        return ResponseEntity.ok().body(solicitacaoAprovacaoService.atualizar(id,dto));
    }
}
