package org.example.pagamentos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.pagamentos.DTO.EnderecoDTO;
import org.example.pagamentos.DTO.EnderecoRequest;
import org.example.pagamentos.DTO.ViaCepDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.EnderecoModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.EnderecoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

        if (enderecoRepository.existsByEmpresaIdEmpresa(enderecoRequest.getIdEmpresa())) {
            throw new RuntimeException("Esta empresa já possui um endereço cadastrado");
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
     * Consulta o CEP na API ViaCEP e retorna os dados de endereço sem salvar
     */
    public ViaCepDTO buscarCep(String cep) {
        String cepLimpo = cep.replaceAll("[^0-9]", "");
        if (cepLimpo.length() != 8) {
            throw new RuntimeException("CEP inválido. Informe 8 dígitos numéricos");
        }

        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://viacep.com.br/ws/" + cepLimpo + "/json/"))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(response.body());

            if (node.has("erro")) {
                throw new RuntimeException("CEP não encontrado");
            }

            ViaCepDTO dto = new ViaCepDTO();
            dto.setCep(node.path("cep").asText());
            dto.setLogradouro(node.path("logradouro").asText());
            dto.setComplemento(node.path("complemento").asText());
            dto.setBairro(node.path("bairro").asText());
            dto.setCidade(node.path("localidade").asText());
            dto.setEstado(node.path("uf").asText());
            return dto;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao consultar CEP: " + e.getMessage());
        }
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
            dto.setNomeEmpresa(enderecoModel.getEmpresa().getNome());
        }

        return dto;
    }
}
