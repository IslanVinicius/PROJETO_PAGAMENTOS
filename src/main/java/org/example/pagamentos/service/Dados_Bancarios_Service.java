package org.example.pagamentos.service;

import org.example.pagamentos.model.Dados_Bancarios_Prestador;
import org.example.pagamentos.model.Prestador;
import org.example.pagamentos.repository.Dados_Bancarios_Repository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Dados_Bancarios_Service {

    @Autowired
    private Dados_Bancarios_Repository dados_Bancarios_Repository;
    @Autowired
    private PrestadorService prestadorService;

    public Dados_Bancarios_Prestador procurarPorID(Long id) {
        return dados_Bancarios_Repository.findById(id).orElseThrow(() -> new RuntimeException("Dados não encontrados"));
    }

    public List<Dados_Bancarios_Prestador> procurarTodos() {
        return dados_Bancarios_Repository.findAll();
    }

    public void deletarPorID(Long id) {
        dados_Bancarios_Repository.deleteById(id);
    }

    public Dados_Bancarios_Prestador cadastrarDados(Dados_Bancarios_Prestador dados){
        Integer idPrestador = dados.getPrestador().getCod_prestador();
        Prestador prestador = prestadorService.procurarPorID(idPrestador);
        dados.setPrestador(prestador);

        return dados_Bancarios_Repository.save(dados);
    }

}
