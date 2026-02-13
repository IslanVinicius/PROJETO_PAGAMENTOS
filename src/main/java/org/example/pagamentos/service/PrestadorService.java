package org.example.pagamentos.service;

import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.repository.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrestadorService {
    @Autowired
    private PrestadorRepository prestadorRepository;

    public List<PrestadorModel> procurarTodos(){
        return prestadorRepository.findAll();
    }

    public PrestadorModel procurarPorID(int id) {
        return prestadorRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuário não encontrado"));
    }

    public PrestadorModel CadastrarPrestador(PrestadorModel prestadorModel) {
        return prestadorRepository.save(prestadorModel);
    }

    public PrestadorModel atualizarPrestador(int id, PrestadorModel dados) {

        PrestadorModel prestadorModel = prestadorRepository.findById(id).orElseThrow(() -> new RuntimeException("Prestador não encontrado"));

        prestadorModel.setNome(dados.getNome());
        prestadorModel.setCpf(dados.getCpf());

        return prestadorRepository.save(prestadorModel);
    }

    public void deletarPrestador(int id) {
        prestadorRepository.deleteById(id);
    }
}
