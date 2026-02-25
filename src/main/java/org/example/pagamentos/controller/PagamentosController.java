package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.PagamentoDTO;
import org.example.pagamentos.service.PagamentoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/pagamentos")
public class PagamentosController {
    private final PagamentoService pagamentoService;
    public PagamentosController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    @GetMapping
    public ResponseEntity<List<PagamentoDTO>> buscarTodosPagamentos(){
        return  ResponseEntity.ok().body(pagamentoService.buscarTodosPagamentos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PagamentoDTO> buscarPorID(@PathVariable Long id){
        return ResponseEntity.ok().body(pagamentoService.buscarPagamentoPorID(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPorID(@PathVariable Long id){
        pagamentoService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
