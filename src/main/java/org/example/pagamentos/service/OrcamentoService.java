package org.example.pagamentos.service;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrcamentoService {
    @Autowired
    private OrcamentoRepository orcamentoRepository;
    @Autowired
    private EmpresaRespository empresaRespository;

    public void salvar(OrcamentoDTO orcamentoDTO) {

        EmpresaModel empresaModel = empresaRespository
                                    .findById(orcamentoDTO
                                    .getEmpresaID())
                                    .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        OrcamentoModel orcamentoModel = new OrcamentoModel();

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());
        orcamentoModel.setEmpresa(empresaModel);

        orcamentoRepository.save(orcamentoModel);
    }

    public List<OrcamentoDTO> listarTodos() {

        List<OrcamentoModel> orcamentoModels = orcamentoRepository.findAll();

        return orcamentoRepository.findAll()
                                  .stream()
                                  .map(this::toDTO)
                                  .toList();

    }

    public OrcamentoDTO buscarPorID(Long orcamentoID) {

        OrcamentoModel orcamentoModel = orcamentoRepository
                                        .findById(orcamentoID)
                                        .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));
        return toDTO(orcamentoModel);
    }



    private OrcamentoDTO toDTO(OrcamentoModel orcamentoModel) {

        OrcamentoDTO orcamentoDTO = new OrcamentoDTO();
        orcamentoDTO.setOrcamentoID(orcamentoModel.getOrcamentoID());
        orcamentoDTO.setEmpresaNome(orcamentoModel.getEmpresa().getNome());
        orcamentoDTO.setDescricao(orcamentoModel.getDescricao());
        orcamentoDTO.setValor(orcamentoModel.getValor());
        orcamentoDTO.setMovimento(orcamentoModel.getMovimento());

        return orcamentoDTO;
    }

}
