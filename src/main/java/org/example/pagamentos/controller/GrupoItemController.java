package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.GrupoItemDTO;
import org.example.pagamentos.service.GrupoItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/grupo-itens")
public class GrupoItemController {

    @Autowired
    private GrupoItemService grupoItemService;

    @PostMapping
    public ResponseEntity<GrupoItemDTO> salvar(@RequestBody GrupoItemDTO grupoItemDTO) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(grupoItemService.salvar(grupoItemDTO));
    }

    @GetMapping
    public ResponseEntity<List<GrupoItemDTO>> listarTodos(@AuthenticationPrincipal UserDetails userDetails) {
        System.out.println(userDetails.getUsername());
        return ResponseEntity.ok().body(grupoItemService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GrupoItemDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok().body(grupoItemService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GrupoItemDTO> atualizar(@PathVariable Long id, @RequestBody GrupoItemDTO grupoItemDTO) {
        return ResponseEntity.ok().body(grupoItemService.atualizar(id, grupoItemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        grupoItemService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<GrupoItemDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok().body(grupoItemService.buscarPorNome(nome));
    }
}
