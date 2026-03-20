package org.example.pagamentos.service;

import org.example.pagamentos.DTO.PagamentoDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.model.PagamentoModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.SolicitacaoAprovacaoModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.Dados_Bancarios_Repository;
import org.example.pagamentos.repository.PagamentoRepository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.repository.SolicitacaoAprovacaoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PrestadorRepository prestadorRepository;
    private final SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository;
    private final Dados_Bancarios_Repository dados_Bancarios_Repository;
    private final AuthenticationUtil authenticationUtil;

    public PagamentoService(PagamentoRepository pagamentoRepository
            , PrestadorRepository prestadorRepository
            , SolicitacaoAprovacaoRepository solicitacaoAprovacaoRepository
            , Dados_Bancarios_Repository dados_Bancarios_Repository
            , AuthenticationUtil authenticationUtil) {
        this.pagamentoRepository = pagamentoRepository;
        this.prestadorRepository = prestadorRepository;
        this.solicitacaoAprovacaoRepository = solicitacaoAprovacaoRepository;
        this.dados_Bancarios_Repository = dados_Bancarios_Repository;
        this.authenticationUtil = authenticationUtil;
    }

    public List<PagamentoDTO> buscarTodosPagamentos(){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            return pagamentoRepository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return pagamentoRepository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    public PagamentoDTO buscarPagamentoPorID(Long id){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PagamentoModel pagamento = pagamentoRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Pagamento não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o pagamento
        if (!authenticationUtil.isAdmin() && !pagamento.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este pagamento");
        }

        return toDTO(pagamento);
    }

    public PagamentoDTO salvarPagamento(PagamentoDTO pagamentoDTO){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PagamentoModel pagamentoModel = new PagamentoModel();

        PrestadorModel prestador = prestadorRepository
                .findById(pagamentoDTO.getPrestadorID())
                .orElseThrow(()-> new RuntimeException("Prestador Não encontrado"));

        SolicitacaoAprovacaoModel solicitacaoAprovacao = solicitacaoAprovacaoRepository
                .findById(pagamentoDTO.getSolicitacaoID())
                .orElseThrow(()-> new RuntimeException("Solicitacao não encontrada"));

        Dados_BancariosModel dados = dados_Bancarios_Repository
                .findByPrestadorModelCodPrestador(prestador.getCodPrestador())
                .orElseThrow(()-> new RuntimeException("Dados Bancarios não encontrados."));


        pagamentoModel.setPrestador(prestador);
        pagamentoModel.setSolicitacaoAprovacao(solicitacaoAprovacao);
        pagamentoModel.setDadosBancarios(dados);
        pagamentoModel.setMovimento(pagamentoDTO.getMovimento());
        pagamentoModel.setUsuarioCriador(usuarioAutenticado);

        return toDTO(pagamentoRepository.save(pagamentoModel));
    }

    public void deleteById(Long id){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PagamentoModel pagamento = pagamentoRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Pagamento não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o pagamento
        if (!authenticationUtil.isAdmin() && !pagamento.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este pagamento");
        }

        pagamentoRepository.deleteById(id);
    }

    @Transactional
    public PagamentoDTO gerarPagamentoAutomatico(SolicitacaoAprovacaoModel solicitacao){
        if(pagamentoRepository
                .existsBySolicitacaoAprovacaoSolicitacaoAprovacaoID(
                        solicitacao.getSolicitacaoAprovacaoID())){

            throw new RuntimeException("Pagamento já foi gerado para essa solicitação.");
        }

        PrestadorModel prestador = solicitacao
                .getOrcamento()
                .getPrestador();

        Dados_BancariosModel dados = dados_Bancarios_Repository
                .findByPrestadorModelCodPrestador(prestador.getCodPrestador())
                .orElseThrow(()->new RuntimeException("Prestador não encontrado"));


        PagamentoModel pagamentoModel = new PagamentoModel();
        pagamentoModel.setPrestador(prestador);
        pagamentoModel.setSolicitacaoAprovacao(solicitacao);
        pagamentoModel.setDadosBancarios(dados);
        pagamentoModel.setMovimento(LocalDate.now());
        pagamentoModel.setUsuarioCriador(solicitacao.getUsuarioCriador());

        return toDTO(pagamentoRepository.save(pagamentoModel));
    }


    private PagamentoDTO toDTO(PagamentoModel pagamentoModel){

        PagamentoDTO pagamentoDTO = new PagamentoDTO();

        pagamentoDTO.setPagamentoID(pagamentoModel.getPagamentoID());
        pagamentoDTO.setPrestadorID(pagamentoModel.getPrestador().getCodPrestador());
        pagamentoDTO.setSolicitacaoID(pagamentoModel.getSolicitacaoAprovacao().getSolicitacaoAprovacaoID());
        pagamentoDTO.setDadosBancariosID(pagamentoModel.getDadosBancarios().getId());
        pagamentoDTO.setMovimento(pagamentoModel.getMovimento());

        return pagamentoDTO;
    }
}
