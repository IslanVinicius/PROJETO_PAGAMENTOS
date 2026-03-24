package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.DTO.OrcamentoImagemDTO;
import org.example.pagamentos.service.OrcamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/orcamento")
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
    public ResponseEntity<List<OrcamentoDTO>> listarTodos(@AuthenticationPrincipal UserDetails userDetails) {
        System.out.println(userDetails.getUsername());

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

    @GetMapping("/disponiveis")
    public ResponseEntity<List<OrcamentoDTO>> buscarOrcamentosDisponiveis() {
        return ResponseEntity.ok().body(orcamentoService.listarOrcamentosDisponiveis());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrcamentoDTO>  atualizar(@PathVariable Long id, @RequestBody OrcamentoDTO orcamentoDTO) {
        return ResponseEntity.ok().body(orcamentoService.atualizarOrcamento(id, orcamentoDTO));
    }

    // Endpoints para upload de imagens
    @PostMapping(value = "/{id}/imagens", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrcamentoImagemDTO> uploadImagem(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        OrcamentoImagemDTO imagem = orcamentoService.salvarImagem(id, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(imagem);
    }

    @GetMapping("/{id}/imagens")
    public ResponseEntity<List<OrcamentoImagemDTO>> listarImagens(@PathVariable Long id) {
        return ResponseEntity.ok(orcamentoService.listarImagens(id));
    }

    @GetMapping("/{id}/imagens/{imagemId}")
    public ResponseEntity<byte[]> obterImagem(
            @PathVariable Long id,
            @PathVariable Long imagemId) throws IOException {
        OrcamentoImagemDTO imagem = orcamentoService.obterImagem(id, imagemId);
        byte[] dados = orcamentoService.carregarImagem(imagem);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(imagem.getTipoArquivo()));
        headers.setContentLength(dados.length);
        headers.setContentDispositionFormData("inline", imagem.getNomeArquivo());
        
        return new ResponseEntity<>(dados, headers, HttpStatus.OK);
    }

    @DeleteMapping("/{orcamentoId}/imagens/{imagemId}")
    public ResponseEntity<Void> deletarImagem(
            @PathVariable Long orcamentoId,
            @PathVariable Long imagemId) {
        orcamentoService.deletarImagem(orcamentoId, imagemId);
        return ResponseEntity.noContent().build();
    }

}
