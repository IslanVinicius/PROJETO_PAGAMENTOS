package org.example.pagamentos.service;

import org.example.pagamentos.DTO.DescontoItemDTO;
import org.example.pagamentos.DTO.ItemDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.DescontoItemModel;
import org.example.pagamentos.model.GrupoItemModel;
import org.example.pagamentos.model.ItemModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.DescontoItemRepository;
import org.example.pagamentos.repository.GrupoItemRepository;
import org.example.pagamentos.repository.ItemRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final GrupoItemRepository grupoItemRepository;
    private final DescontoItemRepository descontoItemRepository;
    private final AuthenticationUtil authenticationUtil;

    @Autowired
    public ItemService(ItemRepository itemRepository,
                       GrupoItemRepository grupoItemRepository,
                       DescontoItemRepository descontoItemRepository,
                       AuthenticationUtil authenticationUtil) {
        this.itemRepository = itemRepository;
        this.grupoItemRepository = grupoItemRepository;
        this.descontoItemRepository = descontoItemRepository;
        this.authenticationUtil = authenticationUtil;
    }

    @Transactional
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
        itemModel.setPrecoMedio(itemDTO.getPrecoMedio());
        itemModel.setTipoUnitario(itemDTO.getTipoUnitario());
        itemModel.setGrupo(grupo);
        itemModel.setUsuarioCriador(usuarioAutenticado);

        // Adicionar descontos progressivos
        if (itemDTO.getDescontos() != null && !itemDTO.getDescontos().isEmpty()) {
            for (DescontoItemDTO descontoDTO : itemDTO.getDescontos()) {
                DescontoItemModel desconto = new DescontoItemModel();
                desconto.setItem(itemModel);
                desconto.setQuantidadeMinima(descontoDTO.getQuantidadeMinima());
                
                // Se o usuário informou valorFinal, calcula o percentual
                if (descontoDTO.getValorFinal() != null && itemDTO.getValorUnitario() != null) {
                    desconto.setValorFinal(descontoDTO.getValorFinal());
                    float percentual = ((itemDTO.getValorUnitario() - descontoDTO.getValorFinal()) / itemDTO.getValorUnitario()) * 100;
                    desconto.setPercentualDesconto(percentual);
                } else {
                    // Se informou percentual, usa diretamente
                    desconto.setPercentualDesconto(descontoDTO.getPercentualDesconto());
                    if (descontoDTO.getPercentualDesconto() != null && itemDTO.getValorUnitario() != null) {
                        float valorFinal = itemDTO.getValorUnitario() * (1 - (descontoDTO.getPercentualDesconto() / 100));
                        desconto.setValorFinal(valorFinal);
                    }
                }
                
                desconto.setDescricao(descontoDTO.getDescricao());
                itemModel.getDescontos().add(desconto);
            }
        }

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

    @Transactional
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
        itemModel.setPrecoMedio(itemDTO.getPrecoMedio());
        itemModel.setTipoUnitario(itemDTO.getTipoUnitario());

        // Atualizar descontos progressivos
        if (itemDTO.getDescontos() != null) {
            // Limpar descontos existentes
            itemModel.getDescontos().clear();
            
            // Adicionar novos descontos
            for (DescontoItemDTO descontoDTO : itemDTO.getDescontos()) {
                DescontoItemModel desconto = new DescontoItemModel();
                desconto.setItem(itemModel);
                desconto.setQuantidadeMinima(descontoDTO.getQuantidadeMinima());
                
                // Se o usuário informou valorFinal, calcula o percentual
                if (descontoDTO.getValorFinal() != null && itemDTO.getValorUnitario() != null) {
                    desconto.setValorFinal(descontoDTO.getValorFinal());
                    float percentual = ((itemDTO.getValorUnitario() - descontoDTO.getValorFinal()) / itemDTO.getValorUnitario()) * 100;
                    desconto.setPercentualDesconto(percentual);
                } else {
                    // Se informou percentual, usa diretamente
                    desconto.setPercentualDesconto(descontoDTO.getPercentualDesconto());
                    if (descontoDTO.getPercentualDesconto() != null && itemDTO.getValorUnitario() != null) {
                        float valorFinal = itemDTO.getValorUnitario() * (1 - (descontoDTO.getPercentualDesconto() / 100));
                        desconto.setValorFinal(valorFinal);
                    }
                }
                
                desconto.setDescricao(descontoDTO.getDescricao());
                itemModel.getDescontos().add(desconto);
            }
        }

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
        dto.setPrecoMedio(itemModel.getPrecoMedio());
        dto.setTipoUnitario(itemModel.getTipoUnitario());
        dto.setIdGrupo(itemModel.getGrupo().getIdGrupo());
        
        // Converter descontos
        if (itemModel.getDescontos() != null) {
            List<DescontoItemDTO> descontosDTO = itemModel.getDescontos().stream()
                .map(desconto -> new DescontoItemDTO(
                    desconto.getIdDesconto(),
                    desconto.getQuantidadeMinima(),
                    desconto.getPercentualDesconto(),
                    desconto.getValorFinal(),
                    desconto.getDescricao()
                ))
                .collect(Collectors.toList());
            dto.setDescontos(descontosDTO);
        }
        
        return dto;
    }
}
