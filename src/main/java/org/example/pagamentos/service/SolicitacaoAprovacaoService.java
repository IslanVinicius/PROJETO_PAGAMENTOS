package org.example.pagamentos.service;

import org.example.pagamentos.DTO.SolicitacaoAprovacaoDTO;
import org.example.pagamentos.Enums.StatusSolicitacao;
import org.example.pagamentos.model.SolicitacaoAprovacaoModel;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.repository.PagamentoRepository;
import org.example.pagamentos.repository.SolicitacaoAprovacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SolicitacaoAprovacaoService {

    private final SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final PagamentoService pagamentoService;

    public SolicitacaoAprovacaoService(SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository,
                                       OrcamentoRepository orcamentoRepository,
                                       PagamentoService pagamentoService) {
        this.solicitacaoAprovacaoRepository = solicitacaoAprovacaoRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.pagamentoService = pagamentoService;
    }

    public SolicitacaoAprovacaoDTO procurarPorID(Long id) {
        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()->new RuntimeException("Solicitação não encontrada"));
        return toDTO(model);

    }

    public List<SolicitacaoAprovacaoDTO> procurarTodos(){
         return solicitacaoAprovacaoRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public SolicitacaoAprovacaoDTO salvar(SolicitacaoAprovacaoDTO dto){

        SolicitacaoAprovacaoModel model = new SolicitacaoAprovacaoModel();
        model.setMovimento(dto.getMovimento());
        model.setStatusSolicitacao(dto.getStatusSolicitacao());
        model.setOrcamento(orcamentoRepository
                .getReferenceById(dto.getOrcamentoId()));

        return toDTO(solicitacaoAprovacaoRepository.save(model));
    }

    public void deletar(Long id){
        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Solicitação não encontrada"));
        solicitacaoAprovacaoRepository.delete(model);
    }

    public SolicitacaoAprovacaoDTO atualizar(Long id, SolicitacaoAprovacaoDTO dto){
        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Solicitação não encontrada"));


        if(model.getStatusSolicitacao() != dto.getStatusSolicitacao()){

            if(dto.getStatusSolicitacao() == StatusSolicitacao.APROVADO){
                aprovarSolicitacao(model);
            } else {
              model.setStatusSolicitacao(dto.getStatusSolicitacao());
            }

        }

        dto.setMovimento(LocalDate.now());

        return toDTO(solicitacaoAprovacaoRepository.save(model));
    }

    @Transactional
    public void aprovarSolicitacao(SolicitacaoAprovacaoModel model){

        if (model.getStatusSolicitacao() == StatusSolicitacao.APROVADO) {
            throw new RuntimeException("Solicitação já está aprovada.");
        }

        model.setStatusSolicitacao(StatusSolicitacao.APROVADO);

        pagamentoService.gerarPagamentoAutomatico(model);
    }


    private SolicitacaoAprovacaoDTO toDTO(SolicitacaoAprovacaoModel model) {

        SolicitacaoAprovacaoDTO dto = new SolicitacaoAprovacaoDTO();
        dto.setSolicitacaoAprovacaoId(model.getSolicitacaoAprovacaoID());
        dto.setMovimento(model.getMovimento());
        dto.setOrcamentoId(model.getOrcamento().getOrcamentoID());
        dto.setStatusSolicitacao(model.getStatusSolicitacao());

        return dto;
    }
}
