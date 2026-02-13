package org.example.pagamentos.service;

import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.repository.Dados_Bancarios_Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Dados_Bancarios_Service {

    @Autowired
    private Dados_Bancarios_Repository dados_Bancarios_Repository;
    @Autowired
    private PrestadorService prestadorService;

    public Dados_BancariosModel procurarPorID(Long id) {
        return dados_Bancarios_Repository.findById(id).orElseThrow(() -> new RuntimeException("Dados não encontrados"));
    }

    public List<Dados_BancariosModel> procurarTodos() {
        return dados_Bancarios_Repository.findAll();
    }

    public void deletarPorID(Long id) {
        dados_Bancarios_Repository.deleteById(id);
    }

    public Dados_BancariosModel cadastrarDados(Dados_BancariosModel dados){
        Integer idPrestador = dados.getPrestadorModel().getCod_prestador();
        PrestadorModel prestadorModel = prestadorService.procurarPorID(idPrestador);
        dados.setPrestadorModel(prestadorModel);

        return dados_Bancarios_Repository.save(dados);
    }

}
