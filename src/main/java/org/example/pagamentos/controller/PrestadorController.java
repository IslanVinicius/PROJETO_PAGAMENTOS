package org.example.pagamentos.controller;

import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.service.PrestadorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/prestador")
public class PrestadorController {
    @Autowired
    private PrestadorService prestadorService;

    @GetMapping
    public List<PrestadorModel> procurarTodos(){
        return prestadorService.procurarTodos();
    }

    @GetMapping("/{id}")
    public PrestadorModel procurarPorID(@PathVariable int id){
        return prestadorService.procurarPorID(id);
    }

    @PostMapping
    public PrestadorModel salvar(@RequestBody PrestadorModel prestadorModel){
        return prestadorService.CadastrarPrestador(prestadorModel);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable int id){
        prestadorService.deletarPrestador(id);
    }

    @PutMapping("/{id}")
    public PrestadorModel atualizar(@PathVariable int id, @RequestBody PrestadorModel prestadorModel){
        return prestadorService.atualizarPrestador(id, prestadorModel);
    }

}
