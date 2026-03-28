package org.example.pagamentos.service;

import org.example.pagamentos.DTO.EnderecoDTO;
import org.example.pagamentos.DTO.EnderecoRequest;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.EnderecoModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.EnderecoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnderecoService {

    private final EnderecoRepository enderecoRepository;
    private final EmpresaRespository empresaRepository;
    private final AuthenticationUtil authenticationUtil;

    public EnderecoService(EnderecoRepository enderecoRepository, 
                          EmpresaRespository empresaRepository,
                          AuthenticationUtil authenticationUtil) {
        this.enderecoRepository = enderecoRepository;
        this.empresaRepository = empresaRepository;
        this.authenticationUtil = authenticationUtil;
    }

    /**
     * Busca um endereço por ID
     */
    public EnderecoDTO buscarPorId(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        EnderecoModel enderecoModel = enderecoRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o endereço
        if (!authenticationUtil.isAdmin() && 
            !enderecoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este endereço");
        }

        return toDTO(enderecoModel);
    }

    /**
     * Lista todos os endereços do usuário ou todos se for ADMIN
     */
    public List<EnderecoDTO> listarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        List<EnderecoDTO> listaDTO;
        
        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            listaDTO = enderecoRepository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            listaDTO = enderecoRepository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }

        return listaDTO;
    }

    /**
     * Lista endereços de uma empresa específica
     */
    public List<EnderecoDTO> listarPorEmpresa(Long idEmpresa) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // Verifica se a empresa existe e se o usuário tem acesso
        EmpresaModel empresa = empresaRepository
                .findById(idEmpresa)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (!authenticationUtil.isAdmin() && 
            !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar os endereços desta empresa");
        }

        return enderecoRepository
                .findByEmpresaIdEmpresa(idEmpresa)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Cadastra um novo endereço
     */
    @Transactional
    public EnderecoDTO cadastrarEndereco(EnderecoRequest enderecoRequest) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // Verifica se a empresa existe e se o usuário tem permissão
        EmpresaModel empresa = empresaRepository
                .findById(enderecoRequest.getIdEmpresa())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (!authenticationUtil.isAdmin() && 
            !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para criar endereços nesta empresa");
        }

        EnderecoModel endereco = new EnderecoModel();
        endereco.setCep(enderecoRequest.getCep());
        endereco.setLogradouro(enderecoRequest.getLogradouro());
        endereco.setNumero(enderecoRequest.getNumero());
        endereco.setComplemento(enderecoRequest.getComplemento());
        endereco.setBairro(enderecoRequest.getBairro());
        endereco.setCidade(enderecoRequest.getCidade());
        endereco.setEstado(enderecoRequest.getEstado());
        endereco.setEmpresa(empresa);
        endereco.setUsuarioCriador(usuarioAutenticado);

        return toDTO(enderecoRepository.save(endereco));
    }

    /**
     * Atualiza um endereço existente
     */
    @Transactional
    public EnderecoDTO atualizarEndereco(Long id, EnderecoRequest enderecoRequest) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        EnderecoModel endereco = enderecoRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o endereço
        if (!authenticationUtil.isAdmin() && 
            !endereco.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este endereço");
        }

        // Verifica se a empresa existe e se o usuário tem permissão
        EmpresaModel empresa = empresaRepository
                .findById(enderecoRequest.getIdEmpresa())
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (!authenticationUtil.isAdmin() && 
            !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para associar este endereço a esta empresa");
        }

        endereco.setCep(enderecoRequest.getCep());
        endereco.setLogradouro(enderecoRequest.getLogradouro());
        endereco.setNumero(enderecoRequest.getNumero());
        endereco.setComplemento(enderecoRequest.getComplemento());
        endereco.setBairro(enderecoRequest.getBairro());
        endereco.setCidade(enderecoRequest.getCidade());
        endereco.setEstado(enderecoRequest.getEstado());
        endereco.setEmpresa(empresa);

        return toDTO(enderecoRepository.save(endereco));
    }

    /**
     * Deleta um endereço
     */
    @Transactional
    public void deletarEndereco(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        EnderecoModel endereco = enderecoRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Endereço não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o endereço
        if (!authenticationUtil.isAdmin() && 
            !endereco.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este endereço");
        }

        enderecoRepository.delete(endereco);
    }

    /**
     * Busca endereço via API externa de IA e associa à empresa
     * Este método simula uma integração com serviço externo de IA
     * Na implementação real, você integraria com uma API como ViaCEP, Google Maps, etc.
     */
    @Transactional
    public EnderecoDTO buscarEnderecoViaIA(String cep, Long idEmpresa) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // Verifica se a empresa existe e se o usuário tem permissão
        EmpresaModel empresa = empresaRepository
                .findById(idEmpresa)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        if (!authenticationUtil.isAdmin() && 
            !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para adicionar endereços a esta empresa");
        }

        // TODO: Implementar integração com API externa de IA
        // Exemplo: ViaCEP, Google Maps API, ou outro serviço de geocoding
        
        // Simulação de chamada à API de IA
        // Em produção, usar RestTemplate, WebClient ou FeignClient
        EnderecoModel enderecoExistente = enderecoRepository
                .findByIdEnderecoAndUsuarioCriador(empresa.getIdEmpresa(), usuarioAutenticado);
        
        // Se já existir um endereço para este CEP nesta empresa, retorna o existente
        if (enderecoExistente != null && enderecoExistente.getCep().equals(cep)) {
            return toDTO(enderecoExistente);
        }

        // Cria um novo endereço com dados simulados da IA
        // Na implementação real, os dados viriam da API externa
        EnderecoModel novoEndereco = new EnderecoModel();
        novoEndereco.setCep(cep);
        novoEndereco.setLogradouro("Rua Exemplo (dados da IA)");
        novoEndereco.setNumero("S/N");
        novoEndereco.setComplemento("");
        novoEndereco.setBairro("Bairro Exemplo");
        novoEndereco.setCidade("Cidade Exemplo");
        novoEndereco.setEstado("SP");
        novoEndereco.setEmpresa(empresa);
        novoEndereco.setUsuarioCriador(usuarioAutenticado);

        return toDTO(enderecoRepository.save(novoEndereco));
    }

    /**
     * Converte Entity para DTO
     */
    private EnderecoDTO toDTO(EnderecoModel enderecoModel) {
        EnderecoDTO dto = new EnderecoDTO();
        dto.setIdEndereco(enderecoModel.getIdEndereco());
        dto.setCep(enderecoModel.getCep());
        dto.setLogradouro(enderecoModel.getLogradouro());
        dto.setNumero(enderecoModel.getNumero());
        dto.setComplemento(enderecoModel.getComplemento());
        dto.setBairro(enderecoModel.getBairro());
        dto.setCidade(enderecoModel.getCidade());
        dto.setEstado(enderecoModel.getEstado());
        
        if (enderecoModel.getEmpresa() != null) {
            dto.setIdEmpresa(enderecoModel.getEmpresa().getIdEmpresa());
        }
        
        return dto;
    }
}
