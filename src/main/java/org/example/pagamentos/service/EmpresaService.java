package org.example.pagamentos.service;

import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.repository.EmpresaRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    @Autowired
    EmpresaRespository  empresaRespository;

    public EmpresaModel buscarPorId(Long id){
        return empresaRespository.findById(id).orElseThrow(()-> new RuntimeException("Empresa não encontrada"));
    }

    public List<EmpresaModel> buscarTodos(){
        return empresaRespository.findAll();
    }

}
