package org.example.pagamentos.service;

import org.example.pagamentos.DTO.GrupoItemDTO;
import org.example.pagamentos.DTO.ItemDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.GrupoItemModel;
import org.example.pagamentos.model.ItemModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.GrupoItemRepository;
import org.example.pagamentos.repository.ItemRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GrupoItemService {

    private final GrupoItemRepository grupoItemRepository;
    private final ItemRepository itemRepository;
    private final AuthenticationUtil authenticationUtil;

    @Autowired
    public GrupoItemService(GrupoItemRepository grupoItemRepository,
                            ItemRepository itemRepository,
                            AuthenticationUtil authenticationUtil) {
        this.grupoItemRepository = grupoItemRepository;
        this.itemRepository = itemRepository;
        this.authenticationUtil = authenticationUtil;
    }

    public GrupoItemDTO salvar(GrupoItemDTO grupoItemDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupoItemModel = new GrupoItemModel();
        grupoItemModel.setNome(grupoItemDTO.getNome());
        grupoItemModel.setDescricao(grupoItemDTO.getDescricao());
        grupoItemModel.setUsuarioCriador(usuarioAutenticado);

        grupoItemRepository.save(grupoItemModel);

        return toDTO(grupoItemModel);
    }

    public List<GrupoItemDTO> listarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            return grupoItemRepository.findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return grupoItemRepository.findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    public GrupoItemDTO buscarPorId(Long idGrupo) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupoItemModel = grupoItemRepository
                .findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o grupo
        if (!authenticationUtil.isAdmin() && !grupoItemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este grupo de itens");
        }

        return toDTOComItens(grupoItemModel);
    }

    public GrupoItemDTO atualizar(Long idGrupo, GrupoItemDTO grupoItemDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupoItemModel = grupoItemRepository
                .findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o grupo
        if (!authenticationUtil.isAdmin() && !grupoItemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este grupo de itens");
        }

        grupoItemModel.setNome(grupoItemDTO.getNome());
        grupoItemModel.setDescricao(grupoItemDTO.getDescricao());

        return toDTO(grupoItemRepository.save(grupoItemModel));
    }

    public void deletar(Long idGrupo) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupoItemModel = grupoItemRepository
                .findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o grupo
        if (!authenticationUtil.isAdmin() && !grupoItemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este grupo de itens");
        }

        grupoItemRepository.delete(grupoItemModel);
    }

    public List<GrupoItemDTO> buscarPorNome(String nome) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        List<GrupoItemModel> grupos = grupoItemRepository.findByNomeContainingIgnoreCase(nome);

        // Filtra por permissão
        if (authenticationUtil.isAdmin()) {
            return grupos.stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return grupos.stream()
                    .filter(g -> g.getUsuarioCriador().getId().equals(usuarioAutenticado.getId()))
                    .map(this::toDTO)
                    .toList();
        }
    }

    private GrupoItemDTO toDTO(GrupoItemModel grupoItemModel) {
        GrupoItemDTO dto = new GrupoItemDTO();
        dto.setIdGrupo(grupoItemModel.getIdGrupo());
        dto.setNome(grupoItemModel.getNome());
        dto.setDescricao(grupoItemModel.getDescricao());
        return dto;
    }

    private GrupoItemDTO toDTOComItens(GrupoItemModel grupoItemModel) {
        GrupoItemDTO dto = toDTO(grupoItemModel);

        // Busca os itens do grupo
        List<ItemModel> itens = itemRepository.findByGrupo(grupoItemModel);
        List<ItemDTO> itensDTO = itens.stream()
                .map(this::toItemDTO)
                .collect(Collectors.toList());

        dto.setItens(itensDTO);
        return dto;
    }

    private ItemDTO toItemDTO(ItemModel itemModel) {
        ItemDTO dto = new ItemDTO();
        dto.setIdItem(itemModel.getIdItem());
        dto.setNome(itemModel.getNome());
        dto.setDescricao(itemModel.getDescricao());
        dto.setValorUnitario(itemModel.getValorUnitario());
        dto.setIdGrupo(itemModel.getGrupo().getIdGrupo());
        return dto;
    }
}
