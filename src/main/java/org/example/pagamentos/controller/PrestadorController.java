package org.example.pagamentos.controller;

import org.example.pagamentos.model.Prestador;
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
    public List<Prestador> procurarTodos(){
        return prestadorService.procurarTodos();
    }

    @GetMapping("/{id}")
    public Prestador procurarPorID(@PathVariable int id){
        return prestadorService.procurarPorID(id);
    }

    @PostMapping
    public Prestador salvar(@RequestBody Prestador prestador){
        return prestadorService.CadastrarPrestador(prestador);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable int id){
        prestadorService.deletarPrestador(id);
    }

    @PutMapping("/{id}")
    public Prestador atualizar(@PathVariable int id,@RequestBody Prestador prestador){
        return prestadorService.atualizarPrestador(id,prestador);
    }

}
