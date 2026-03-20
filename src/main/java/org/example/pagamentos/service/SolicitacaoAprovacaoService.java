package org.example.pagamentos.service;

import org.example.pagamentos.DTO.SolicitacaoAprovacaoDTO;
import org.example.pagamentos.Enums.StatusSolicitacao;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.SolicitacaoAprovacaoModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.repository.PagamentoRepository;
import org.example.pagamentos.repository.SolicitacaoAprovacaoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SolicitacaoAprovacaoService {

    private final SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository;
    private final OrcamentoRepository orcamentoRepository;
    private final PagamentoService pagamentoService;
    private final AuthenticationUtil authenticationUtil;

    public SolicitacaoAprovacaoService(SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository,
                                       OrcamentoRepository orcamentoRepository,
                                       PagamentoService pagamentoService,
                                       AuthenticationUtil authenticationUtil) {
        this.solicitacaoAprovacaoRepository = solicitacaoAprovacaoRepository;
        this.orcamentoRepository = orcamentoRepository;
        this.pagamentoService = pagamentoService;
        this.authenticationUtil = authenticationUtil;
    }

    public SolicitacaoAprovacaoDTO procurarPorID(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()->new RuntimeException("Solicitação não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a solicitação
        if (!authenticationUtil.isAdmin() && !model.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar esta solicitação");
        }

        return toDTO(model);
    }

    public List<SolicitacaoAprovacaoDTO> procurarTodos(){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN vê todas, SOLICITANTE vê apenas suas
        if (authenticationUtil.isAdmin()) {
            return solicitacaoAprovacaoRepository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return solicitacaoAprovacaoRepository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    public SolicitacaoAprovacaoDTO salvar(SolicitacaoAprovacaoDTO dto){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        SolicitacaoAprovacaoModel model = new SolicitacaoAprovacaoModel();
        model.setMovimento(dto.getMovimento());
        model.setStatusSolicitacao(dto.getStatusSolicitacao());
        model.setOrcamento(orcamentoRepository
                .getReferenceById(dto.getOrcamentoId()));
        model.setUsuarioCriador(usuarioAutenticado);

        return toDTO(solicitacaoAprovacaoRepository.save(model));
    }

    public void deletar(Long id){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Solicitação não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a solicitação
        if (!authenticationUtil.isAdmin() && !model.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar esta solicitação");
        }

        solicitacaoAprovacaoRepository.delete(model);
    }

    public SolicitacaoAprovacaoDTO atualizar(Long id, SolicitacaoAprovacaoDTO dto){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        SolicitacaoAprovacaoModel model = solicitacaoAprovacaoRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Solicitação não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a solicitação
        if (!authenticationUtil.isAdmin() && !model.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar esta solicitação");
        }

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
