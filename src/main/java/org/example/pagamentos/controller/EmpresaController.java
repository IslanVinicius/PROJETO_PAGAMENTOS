package org.example.pagamentos.controller;

import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.service.EmpresaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/empresa")
public class EmpresaController {
    @Autowired
    private EmpresaService empresaService;

    @GetMapping
    public List<EmpresaModel> buscarTodos(){
        return empresaService.buscarTodos();
    }

    @GetMapping("/{id}")
    public EmpresaModel buscarPorID(@PathVariable Long id){
        return empresaService.buscarPorId(id);
    }
}
