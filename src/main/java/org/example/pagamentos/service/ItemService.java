package org.example.pagamentos.service;

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

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final GrupoItemRepository grupoItemRepository;
    private final AuthenticationUtil authenticationUtil;

    @Autowired
    public ItemService(ItemRepository itemRepository,
                       GrupoItemRepository grupoItemRepository,
                       AuthenticationUtil authenticationUtil) {
        this.itemRepository = itemRepository;
        this.grupoItemRepository = grupoItemRepository;
        this.authenticationUtil = authenticationUtil;
    }

    public ItemDTO salvar(ItemDTO itemDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupo = grupoItemRepository
                .findById(itemDTO.getIdGrupo())
                .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

        // Verifica se o usuário tem permissão para adicionar itens ao grupo
        if (!authenticationUtil.isAdmin() && !grupo.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para adicionar itens a este grupo");
        }

        ItemModel itemModel = new ItemModel();
        itemModel.setNome(itemDTO.getNome());
        itemModel.setDescricao(itemDTO.getDescricao());
        itemModel.setValorUnitario(itemDTO.getValorUnitario());
        itemModel.setGrupo(grupo);
        itemModel.setUsuarioCriador(usuarioAutenticado);

        itemRepository.save(itemModel);

        return toDTO(itemModel);
    }

    public List<ItemDTO> listarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // ADMIN vê todos, SOLICITANTE vê apenas seus
        if (authenticationUtil.isAdmin()) {
            return itemRepository.findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return itemRepository.findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }
    }

    public List<ItemDTO> listarPorGrupo(Long idGrupo) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        GrupoItemModel grupo = grupoItemRepository
                .findById(idGrupo)
                .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

        // Verifica permissão
        if (!authenticationUtil.isAdmin() && !grupo.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para visualizar os itens deste grupo");
        }

        return itemRepository.findByGrupo(grupo)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ItemDTO buscarPorId(Long idItem) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        ItemModel itemModel = itemRepository
                .findById(idItem)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o item
        if (!authenticationUtil.isAdmin() && !itemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este item");
        }

        return toDTO(itemModel);
    }

    public ItemDTO atualizar(Long idItem, ItemDTO itemDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        ItemModel itemModel = itemRepository
                .findById(idItem)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o item
        if (!authenticationUtil.isAdmin() && !itemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este item");
        }

        // Se o grupo foi alterado, verifica permissão no novo grupo
        if (!itemModel.getGrupo().getIdGrupo().equals(itemDTO.getIdGrupo())) {
            GrupoItemModel novoGrupo = grupoItemRepository
                    .findById(itemDTO.getIdGrupo())
                    .orElseThrow(() -> new RuntimeException("Grupo de itens não encontrado"));

            if (!authenticationUtil.isAdmin() && !novoGrupo.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
                throw new AccessDeniedException("Você não tem permissão para mover o item para este grupo");
            }

            itemModel.setGrupo(novoGrupo);
        }

        itemModel.setNome(itemDTO.getNome());
        itemModel.setDescricao(itemDTO.getDescricao());
        itemModel.setValorUnitario(itemDTO.getValorUnitario());

        return toDTO(itemRepository.save(itemModel));
    }

    public void deletar(Long idItem) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        ItemModel itemModel = itemRepository
                .findById(idItem)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        // Verifica se o usuário é ADMIN ou se criou o item
        if (!authenticationUtil.isAdmin() && !itemModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este item");
        }

        itemRepository.delete(itemModel);
    }

    public List<ItemDTO> buscarPorNome(String nome) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        List<ItemModel> itens = itemRepository.findByNomeContainingIgnoreCase(nome);

        // Filtra por permissão
        if (authenticationUtil.isAdmin()) {
            return itens.stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            return itens.stream()
                    .filter(i -> i.getUsuarioCriador().getId().equals(usuarioAutenticado.getId()))
                    .map(this::toDTO)
                    .toList();
        }
    }

    private ItemDTO toDTO(ItemModel itemModel) {
        ItemDTO dto = new ItemDTO();
        dto.setIdItem(itemModel.getIdItem());
        dto.setNome(itemModel.getNome());
        dto.setDescricao(itemModel.getDescricao());
        dto.setValorUnitario(itemModel.getValorUnitario());
        dto.setIdGrupo(itemModel.getGrupo().getIdGrupo());
        return dto;
    }
}
