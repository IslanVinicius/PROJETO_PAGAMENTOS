package org.example.pagamentos.service;

import org.example.pagamentos.DTO.PrestadorDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrestadorService {

    private final PrestadorRepository prestadorRepository;
    private final AuthenticationUtil authenticationUtil;

    public PrestadorService(PrestadorRepository prestadorRepository, AuthenticationUtil authenticationUtil) {
        this.prestadorRepository = prestadorRepository;
        this.authenticationUtil = authenticationUtil;
    }

    public List<PrestadorDTO> procurarTodos(){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN e EXPANSAO veem todos, outros veem apenas seus
        if (authenticationUtil.hasFullDataAccess()) {
            return prestadorRepository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return prestadorRepository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    public PrestadorDTO procurarPorID(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PrestadorModel prestadorModel = prestadorRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Prestador nao encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o prestador
        if (!authenticationUtil.hasFullDataAccess() && !prestadorModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este prestador");
        }

        return toDTO(prestadorModel);
    }

    public PrestadorDTO CadastrarPrestador(PrestadorDTO prestadorDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PrestadorModel prestadorModel = new PrestadorModel();
        prestadorModel.setNome(prestadorDTO.getNome());
        prestadorModel.setCpf(prestadorDTO.getCpf());
        prestadorModel.setUsuarioCriador(usuarioAutenticado);

        return toDTO(prestadorRepository.save(prestadorModel));
    }

    public PrestadorDTO atualizarPrestador(Long id, PrestadorDTO dados) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PrestadorModel prestadorModel = prestadorRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o prestador
        if (!authenticationUtil.hasFullDataAccess() && !prestadorModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este prestador");
        }

        prestadorModel.setNome(dados.getNome());
        prestadorModel.setCpf(dados.getCpf());
        prestadorRepository.save(prestadorModel);

        return toDTO(prestadorModel);
    }

    public void deletarPrestador(Long id) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        PrestadorModel prestador = prestadorRepository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Prestador nao encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o prestador
        if (!authenticationUtil.hasFullDataAccess() && !prestador.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este prestador");
        }

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
