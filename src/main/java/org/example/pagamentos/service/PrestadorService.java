package org.example.pagamentos.service;

import org.example.pagamentos.DTO.PrestadorDTO;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.repository.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrestadorService {

    private final PrestadorRepository prestadorRepository;

    public PrestadorService(PrestadorRepository prestadorRepository) {
        this.prestadorRepository = prestadorRepository;
    }

    public List<PrestadorDTO> procurarTodos(){
        List<PrestadorModel>  listaPrestaodr = prestadorRepository.findAll();

        return prestadorRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public PrestadorDTO procurarPorID(Long id) {
        PrestadorModel prestadorModel = prestadorRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Prestador nao encontrado"));

        return toDTO(prestadorModel);
    }

    public PrestadorDTO CadastrarPrestador(PrestadorDTO prestadorDTO) {
        PrestadorModel prestadorModel = new PrestadorModel();
        prestadorModel.setNome(prestadorDTO.getNome());
        prestadorModel.setCpf(prestadorDTO.getCpf());

        return toDTO(prestadorRepository.save(prestadorModel));
    }

    public PrestadorDTO atualizarPrestador(Long id, PrestadorDTO dados) {

        PrestadorModel prestadorModel = prestadorRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado"));
        prestadorModel.setNome(dados.getNome());
        prestadorModel.setCpf(dados.getCpf());
        prestadorRepository.save(prestadorModel);

        return toDTO(prestadorModel);
    }

    public void deletarPrestador(Long id) {
        PrestadorModel prestador = prestadorRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Prestador nao encontrado"));

        prestadorRepository.delete(prestador);
    }


    private PrestadorDTO toDTO(PrestadorModel prestadorModel) {
        PrestadorDTO prestadorDTO = new PrestadorDTO();

        prestadorDTO.setCod_prestador(prestadorModel.getCodPrestador());
        prestadorDTO.setNome(prestadorModel.getNome());
        prestadorDTO.setCpf(prestadorModel.getCpf());

        return prestadorDTO;
    }
}
