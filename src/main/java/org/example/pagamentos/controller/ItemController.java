package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.ItemDTO;
import org.example.pagamentos.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/itens")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @PostMapping
    public ResponseEntity<ItemDTO> salvar(@RequestBody ItemDTO itemDTO) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(itemService.salvar(itemDTO));
    }

    @GetMapping
    public ResponseEntity<List<ItemDTO>> listarTodos(@AuthenticationPrincipal UserDetails userDetails) {
        System.out.println(userDetails.getUsername());
        return ResponseEntity.ok().body(itemService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok().body(itemService.buscarPorId(id));
    }

    @GetMapping("/grupo/{idGrupo}")
    public ResponseEntity<List<ItemDTO>> listarPorGrupo(@PathVariable Long idGrupo) {
        return ResponseEntity.ok().body(itemService.listarPorGrupo(idGrupo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemDTO> atualizar(@PathVariable Long id, @RequestBody ItemDTO itemDTO) {
        return ResponseEntity.ok().body(itemService.atualizar(id, itemDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        itemService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ItemDTO>> buscarPorNome(@RequestParam String nome) {
        return ResponseEntity.ok().body(itemService.buscarPorNome(nome));
    }
}
