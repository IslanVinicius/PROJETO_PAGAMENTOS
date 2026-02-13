package org.example.pagamentos.controller;

import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.service.Dados_Bancarios_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dadosbancarios")
public class DadosBancarios_Controller {

    @Autowired
    private Dados_Bancarios_Service dados_Bancarios_Service;

    @GetMapping("/{id}")
    public Dados_BancariosModel buscarPorID(@PathVariable Long id){
        return dados_Bancarios_Service.procurarPorID(id);
    }

    @GetMapping
    public List<Dados_BancariosModel> buscarTodos(){
        return dados_Bancarios_Service.procurarTodos();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerPorID(@PathVariable Long id){
        dados_Bancarios_Service.deletarPorID(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public Dados_BancariosModel cadastrarDados(@RequestBody Dados_BancariosModel dados){
        return dados_Bancarios_Service.cadastrarDados(dados);
    }

}
