package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.PrestadorDTO;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.service.PrestadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/prestador")
public class PrestadorController {
    @Autowired
    private PrestadorService prestadorService;

    @GetMapping
    public ResponseEntity<List<PrestadorDTO>> procurarTodos(){
        return ResponseEntity.ok().body(prestadorService.procurarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrestadorDTO> procurarPorID(@PathVariable Long id){
        return ResponseEntity.ok().body(prestadorService.procurarPorID(id));
    }

    @PostMapping
    public ResponseEntity<PrestadorDTO> salvar(@RequestBody PrestadorDTO prestadorDTO){
        return ResponseEntity.ok().body(prestadorService.CadastrarPrestador(prestadorDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id){
        prestadorService.deletarPrestador(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrestadorDTO> atualizar(@PathVariable Long id, @RequestBody PrestadorDTO prestadorDTO){
        return ResponseEntity.ok().body(prestadorService.atualizarPrestador(id, prestadorDTO));
    }

}
