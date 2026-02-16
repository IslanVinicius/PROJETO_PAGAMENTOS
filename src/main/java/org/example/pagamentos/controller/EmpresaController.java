package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.EmpresaDTO;
import org.example.pagamentos.service.EmpresaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/empresa")
public class EmpresaController {

    private final EmpresaService empresaService;
    EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public ResponseEntity<List<EmpresaDTO>> buscarTodos(){
        return ResponseEntity.ok().body(empresaService.buscarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaDTO> buscarPorID(@PathVariable Long id){
        return ResponseEntity.ok().body(empresaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaDTO> salvar(@RequestBody EmpresaDTO empresaDTO){
        return ResponseEntity.status(201).body(empresaService.cadastrarEmpresa(empresaDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id){
        empresaService.deletarEmpresa(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaDTO> atualizar(@PathVariable Long id,@RequestBody EmpresaDTO empresaDTO){
        return ResponseEntity.ok().body(empresaService.atualizarEmpresa(id, empresaDTO));
    }
}
