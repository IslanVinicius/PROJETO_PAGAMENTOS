package org.example.pagamentos.service;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrcamentoService {
    private final OrcamentoRepository orcamentoRepository;
    private final EmpresaRespository empresaRepository;
    private final PrestadorRepository prestadorRepository;

    public OrcamentoService(OrcamentoRepository  orcamentoRepository,
                            EmpresaRespository empresaRepository,
                            PrestadorRepository prestadorRepository) {
        this.orcamentoRepository = orcamentoRepository;
        this.empresaRepository = empresaRepository;
        this.prestadorRepository = prestadorRepository;
    }


    public OrcamentoDTO salvar(OrcamentoDTO orcamentoDTO) {

        EmpresaModel empresaModel = empresaRepository
                                    .getReferenceById(orcamentoDTO
                                    .getEmpresaID());

        PrestadorModel prestadorModel = prestadorRepository
                                    .getReferenceById(orcamentoDTO
                                    .getIdPrestador());

        OrcamentoModel orcamentoModel = new OrcamentoModel();

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());
        orcamentoModel.setEmpresa(empresaModel);
        orcamentoModel.setPrestador(prestadorModel);

        orcamentoRepository.save(orcamentoModel);

        return toDTO(orcamentoModel);
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

    public void deletarPorID(Long orcamentoID) {

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        orcamentoRepository.delete(orcamentoModel);
    }

    public OrcamentoDTO atualizarOrcamento(Long orcamentoID, OrcamentoDTO orcamentoDTO) {
        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());

        return  toDTO(orcamentoRepository.save(orcamentoModel));
    }



    private OrcamentoDTO toDTO(OrcamentoModel orcamentoModel) {

        OrcamentoDTO orcamentoDTO = new OrcamentoDTO();
        orcamentoDTO.setOrcamentoID(orcamentoModel.getOrcamentoID());
        orcamentoDTO.setEmpresaNome(orcamentoModel.getEmpresa().getNome());
        orcamentoDTO.setDescricao(orcamentoModel.getDescricao());
        orcamentoDTO.setValor(orcamentoModel.getValor());
        orcamentoDTO.setMovimento(orcamentoModel.getMovimento());
        orcamentoDTO.setEmpresaNome(orcamentoModel.getEmpresa().getNome());
        orcamentoDTO.setIdPrestador(orcamentoModel.getPrestador().getCod_prestador());

        return orcamentoDTO;
    }

}
