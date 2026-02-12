package org.example.pagamentos.service;

import org.example.pagamentos.model.Prestador;
import org.example.pagamentos.repository.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrestadorService {
    @Autowired
    private PrestadorRepository prestadorRepository;

    public List<Prestador> procurarTodos(){
        return prestadorRepository.findAll();
    }

    public Prestador procurarPorID(int id) {
        return prestadorRepository.findById(id).orElseThrow(()-> new RuntimeException("Usuário não encontrado"));
    }

    public Prestador CadastrarPrestador(Prestador prestador) {
        return prestadorRepository.save(prestador);
    }

    public Prestador atualizarPrestador(int id,Prestador dados) {

        Prestador prestador = prestadorRepository.findById(id).orElseThrow(() -> new RuntimeException("Prestador não encontrado"));

        prestador.setNome(prestador.getNome());
        prestador.setCpf(prestador.getCpf());

        return prestadorRepository.save(prestador);
    }

    public void deletarPrestador(int id) {
        prestadorRepository.deleteById(id);
    }
}
