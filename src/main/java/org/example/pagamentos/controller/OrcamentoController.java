package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.service.OrcamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orcamento")
public class OrcamentoController {
    @Autowired
    private OrcamentoService orcamentoService;

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody OrcamentoDTO orcamentoDTO) {
        orcamentoService.salvar(orcamentoDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<OrcamentoDTO>> listarTodos() {
        return ResponseEntity.ok().body(orcamentoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorID(@PathVariable Long id) {
        return ResponseEntity.ok().body(orcamentoService.buscarPorID(id));
    }
}
