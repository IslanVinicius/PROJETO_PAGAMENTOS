package org.example.pagamentos.service;

import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrcamentoService {
    private final OrcamentoRepository orcamentoRepository;
    private final EmpresaRespository empresaRepository;
    private final PrestadorRepository prestadorRepository;
    private final AuthenticationUtil authenticationUtil;

    public OrcamentoService(OrcamentoRepository  orcamentoRepository,
                            EmpresaRespository empresaRepository,
                            PrestadorRepository prestadorRepository,
                            AuthenticationUtil authenticationUtil) {
        this.orcamentoRepository = orcamentoRepository;
        this.empresaRepository = empresaRepository;
        this.prestadorRepository = prestadorRepository;
        this.authenticationUtil = authenticationUtil;
    }


    public OrcamentoDTO salvar(OrcamentoDTO orcamentoDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = new OrcamentoModel();

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());
        orcamentoModel.setEmpresa(empresaRepository
                .findById(orcamentoDTO
                        .getEmpresaID())
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada")));

        orcamentoModel.setPrestador(prestadorRepository
                .findById(orcamentoDTO
                        .getIdPrestador())
                .orElseThrow(()-> new RuntimeException("Prestador não encontrado")));

        orcamentoModel.setUsuarioCriador(usuarioAutenticado);

        orcamentoRepository.save(orcamentoModel);

        return toDTO(orcamentoModel);
    }

    public List<OrcamentoDTO> listarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            return orcamentoRepository.findAll()
                                      .stream()
                                      .map(this::toDTO)
                                      .toList();
        } else {
            return orcamentoRepository.findByUsuarioCriador(usuarioAutenticado)
                                      .stream()
                                      .map(this::toDTO)
                                      .toList();
        }
    }

    public List<OrcamentoDTO> listarOrcamentosDisponiveis(){
        return orcamentoRepository
                .procurarOrcamentosDisponiveis()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public OrcamentoDTO buscarPorID(Long orcamentoID) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                                        .findById(orcamentoID)
                                        .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o orçamento
        if (!authenticationUtil.isAdmin() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este orçamento");
        }

        return toDTO(orcamentoModel);
    }

    public void deletarPorID(Long orcamentoID) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o orçamento
        if (!authenticationUtil.isAdmin() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este orçamento");
        }

        orcamentoRepository.delete(orcamentoModel);
    }

    public OrcamentoDTO atualizarOrcamento(Long orcamentoID, OrcamentoDTO orcamentoDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o orçamento
        if (!authenticationUtil.isAdmin() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este orçamento");
        }

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());

        return  toDTO(orcamentoRepository.save(orcamentoModel));
    }



    private OrcamentoDTO toDTO(OrcamentoModel orcamentoModel) {

        OrcamentoDTO orcamentoDTO = new OrcamentoDTO();
        orcamentoDTO.setOrcamentoID(orcamentoModel.getOrcamentoID());
        orcamentoDTO.setDescricao(orcamentoModel.getDescricao());
        orcamentoDTO.setValor(orcamentoModel.getValor());
        orcamentoDTO.setMovimento(orcamentoModel.getMovimento());
        orcamentoDTO.setIdPrestador(orcamentoModel.getPrestador().getCodPrestador());
        orcamentoDTO.setEmpresaID(orcamentoModel.getEmpresa().getIdEmpresa());

        return orcamentoDTO;
    }

}
