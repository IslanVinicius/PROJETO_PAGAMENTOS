package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.service.OrcamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/orcamento")
public class OrcamentoController {
    @Autowired
    private OrcamentoService orcamentoService;

    @PostMapping()
    public ResponseEntity<OrcamentoDTO> salvar(@RequestBody OrcamentoDTO orcamentoDTO) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(orcamentoService.salvar(orcamentoDTO));
    }

    @GetMapping
    public ResponseEntity<List<OrcamentoDTO>> listarTodos() {
        return ResponseEntity.ok().body(orcamentoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrcamentoDTO> buscarPorID(@PathVariable Long id) {
        return ResponseEntity.ok().body(orcamentoService.buscarPorID(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPorID(@PathVariable Long id) {
        orcamentoService.deletarPorID(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoDTO>  atualizar(@PathVariable Long id, @RequestBody OrcamentoDTO orcamentoDTO) {
        return ResponseEntity.ok().body(orcamentoService.atualizarOrcamento(id, orcamentoDTO));
    }

}
