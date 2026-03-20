package org.example.pagamentos.service;

import org.example.pagamentos.DTO.Dados_BancariosDTO;
import org.example.pagamentos.DTO.PrestadorDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.Dados_Bancarios_Repository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class Dados_Bancarios_Service {

    private final PrestadorRepository prestadorRepository;
    private final Dados_Bancarios_Repository dados_Bancarios_Repository;
    private final AuthenticationUtil authenticationUtil;

    public Dados_Bancarios_Service(PrestadorRepository prestadorRepository, 
                                   Dados_Bancarios_Repository dados_Bancarios_Repository, 
                                   AuthenticationUtil authenticationUtil) {
        this.prestadorRepository = prestadorRepository;
        this.dados_Bancarios_Repository = dados_Bancarios_Repository;
        this.authenticationUtil = authenticationUtil;
    }

    public Dados_BancariosDTO procurarPorID(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        Dados_BancariosModel dados = dados_Bancarios_Repository
               .findById(id)
               .orElseThrow(() -> new RuntimeException("Dados não encontrados"));

        // Verifica se o usuário é ADMIN ou se criou os dados
        if (!authenticationUtil.isAdmin() && !dados.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar estes dados bancários");
        }

       return toDTO(dados);
    }

    public List<Dados_BancariosDTO> procurarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            return dados_Bancarios_Repository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return dados_Bancarios_Repository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    @Transactional
    public void deletarPorID(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        Dados_BancariosModel dados = dados_Bancarios_Repository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Dados não encontrados"));

        // Verifica se o usuário é ADMIN ou se criou os dados
        if (!authenticationUtil.isAdmin() && !dados.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar estes dados bancários");
        }

        dados_Bancarios_Repository.forcedDelete(id);
    }

    public Dados_BancariosDTO cadastrarDados(Dados_BancariosDTO dados){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        Dados_BancariosModel dadosModel = new Dados_BancariosModel();

        PrestadorModel prestador = prestadorRepository
                .findById(dados.getCodPrestador())
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado"));


        dadosModel.setPrestadorModel(prestador);
        dadosModel.setAgencia(dados.getAgencia());
        dadosModel.setTipoConta(dados.getTipoConta());
        dadosModel.setBanco(dados.getBanco());
        dadosModel.setConta(dados.getConta());
        dadosModel.setChavePix(dados.getChavePix());
        dadosModel.setUsuarioCriador(usuarioAutenticado);


        return toDTO(dados_Bancarios_Repository.save(dadosModel));
    }

    private Dados_BancariosDTO toDTO(Dados_BancariosModel dados){
        Dados_BancariosDTO dto = new Dados_BancariosDTO();

        dto.setDadosId(dados.getId());
        dto.setCodPrestador(dados.getPrestadorModel().getCodPrestador());
        dto.setConta(dados.getConta());
        dto.setTipoConta(dados.getTipoConta());
        dto.setBanco(dados.getBanco());
        dto.setChavePix(dados.getChavePix());
        dto.setAgencia(dados.getAgencia());


        return dto;
    }

}
