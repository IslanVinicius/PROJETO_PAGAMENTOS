package org.example.pagamentos.service;

import org.example.pagamentos.DTO.OrcamentoCompletoDTO;
import org.example.pagamentos.DTO.OrcamentoDTO;
import org.example.pagamentos.DTO.OrcamentoImagemDTO;
import org.example.pagamentos.DTO.OrcamentoItemDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.ItemModel;
import org.example.pagamentos.model.OrcamentoImagemModel;
import org.example.pagamentos.model.OrcamentoItemModel;
import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.ItemRepository;
import org.example.pagamentos.repository.OrcamentoImagemRepository;
import org.example.pagamentos.repository.OrcamentoItemRepository;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrcamentoService {
    private final OrcamentoRepository orcamentoRepository;
    private final EmpresaRespository empresaRepository;
    private final PrestadorRepository prestadorRepository;
    private final OrcamentoItemRepository orcamentoItemRepository;
    private final OrcamentoImagemRepository orcamentoImagemRepository;
    private final ItemRepository itemRepository;
    private final FileUploadService fileUploadService;
    private final AuthenticationUtil authenticationUtil;
    private final org.example.pagamentos.service.ItemService itemService;

    public OrcamentoService(OrcamentoRepository  orcamentoRepository,
                            EmpresaRespository empresaRepository,
                            PrestadorRepository prestadorRepository,
                            OrcamentoItemRepository orcamentoItemRepository,
                            OrcamentoImagemRepository orcamentoImagemRepository,
                            ItemRepository itemRepository,
                            FileUploadService fileUploadService,
                            AuthenticationUtil authenticationUtil,
                            org.example.pagamentos.service.ItemService itemService) {
        this.orcamentoRepository = orcamentoRepository;
        this.empresaRepository = empresaRepository;
        this.prestadorRepository = prestadorRepository;
        this.orcamentoItemRepository = orcamentoItemRepository;
        this.orcamentoImagemRepository = orcamentoImagemRepository;
        this.itemRepository = itemRepository;
        this.fileUploadService = fileUploadService;
        this.authenticationUtil = authenticationUtil;
        this.itemService = itemService;
    }


    @Transactional
    public OrcamentoDTO salvar(OrcamentoDTO orcamentoDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = new OrcamentoModel();

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());
        orcamentoModel.setDesconto(orcamentoDTO.getDesconto());
        orcamentoModel.setTipoPagamento(orcamentoDTO.getTipoPagamento());
        orcamentoModel.setEmpresa(empresaRepository
                .findById(orcamentoDTO
                        .getEmpresaID())
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada")));

        orcamentoModel.setPrestador(prestadorRepository
                .findById(orcamentoDTO
                        .getIdPrestador())
                .orElseThrow(()-> new RuntimeException("Prestador não encontrado")));

        orcamentoModel.setUsuarioCriador(usuarioAutenticado);

        // Salvar orçamento primeiro para obter o ID
        OrcamentoModel orcamentoSalvo = orcamentoRepository.save(orcamentoModel);

        // Processar itens do orçamento - adicionar à coleção existente
        if (orcamentoDTO.getItens() != null && !orcamentoDTO.getItens().isEmpty()) {
            for (OrcamentoItemDTO itemDTO : orcamentoDTO.getItens()) {
                OrcamentoItemModel itemOrcamento = new OrcamentoItemModel();
                itemOrcamento.setOrcamento(orcamentoSalvo);
                
                ItemModel item = itemRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item não encontrado: " + itemDTO.getItemId()));
                
                itemOrcamento.setItem(item);
                itemOrcamento.setQuantidade(itemDTO.getQuantidade());
                itemOrcamento.setValorUnitario(itemDTO.getValorUnitario());
                itemOrcamento.setValorTotal(itemDTO.getQuantidade() * itemDTO.getValorUnitario());
                
                // Adicionar à coleção existente (não criar nova lista)
                orcamentoSalvo.getItens().add(itemOrcamento);
            }
        }

        // Calcular totais
        orcamentoSalvo.calcularTotais();
        orcamentoSalvo = orcamentoRepository.save(orcamentoSalvo);

        // Atualizar precoMedio de todos os itens deste orçamento
        if (orcamentoDTO.getItens() != null && !orcamentoDTO.getItens().isEmpty()) {
            for (OrcamentoItemDTO itemDTO : orcamentoDTO.getItens()) {
                try {
                    itemService.calcularEAtualizarPrecoMedio(itemDTO.getItemId());
                } catch (Exception e) {
                    // Log error but don't fail the transaction
                    System.err.println("Erro ao atualizar precoMedio do item " + itemDTO.getItemId() + ": " + e.getMessage());
                }
            }
        }

        return toDTO(orcamentoSalvo);
    }

    public List<OrcamentoDTO> listarTodos() {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        // ADMIN e EXPANSAO veem todos, outros veem apenas seus
        if (authenticationUtil.hasFullDataAccess()) {
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

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este orçamento");
        }

        return toDTO(orcamentoModel);
    }

    public void deletarPorID(Long orcamentoID) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar este orçamento");
        }

        orcamentoRepository.delete(orcamentoModel);
    }

    @Transactional
    public OrcamentoDTO atualizarOrcamento(Long orcamentoID, OrcamentoDTO orcamentoDTO) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(()-> new RuntimeException("Orcamento não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar este orçamento");
        }

        orcamentoModel.setDescricao(orcamentoDTO.getDescricao());
        orcamentoModel.setValor(orcamentoDTO.getValor());
        orcamentoModel.setMovimento(orcamentoDTO.getMovimento());
        orcamentoModel.setDesconto(orcamentoDTO.getDesconto());
        orcamentoModel.setTipoPagamento(orcamentoDTO.getTipoPagamento());

        // Atualizar itens do orçamento
        if (orcamentoDTO.getItens() != null) {
            // Limpar itens existentes usando a própria coleção
            orcamentoModel.getItens().clear();
            
            // Adicionar novos itens à coleção existente
            for (OrcamentoItemDTO itemDTO : orcamentoDTO.getItens()) {
                OrcamentoItemModel itemOrcamento = new OrcamentoItemModel();
                itemOrcamento.setOrcamento(orcamentoModel);
                
                ItemModel item = itemRepository.findById(itemDTO.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item não encontrado: " + itemDTO.getItemId()));
                
                itemOrcamento.setItem(item);
                itemOrcamento.setQuantidade(itemDTO.getQuantidade());
                itemOrcamento.setValorUnitario(itemDTO.getValorUnitario());
                itemOrcamento.setValorTotal(itemDTO.getQuantidade() * itemDTO.getValorUnitario());
                
                // Adicionar à coleção existente (não criar nova lista)
                orcamentoModel.getItens().add(itemOrcamento);
            }
        }

        // Calcular totais
        orcamentoModel.calcularTotais();

        OrcamentoDTO result = toDTO(orcamentoRepository.save(orcamentoModel));

        // Atualizar precoMedio de todos os itens deste orçamento
        if (orcamentoDTO.getItens() != null && !orcamentoDTO.getItens().isEmpty()) {
            for (OrcamentoItemDTO itemDTO : orcamentoDTO.getItens()) {
                try {
                    itemService.calcularEAtualizarPrecoMedio(itemDTO.getItemId());
                } catch (Exception e) {
                    // Log error but don't fail the transaction
                    System.err.println("Erro ao atualizar precoMedio do item " + itemDTO.getItemId() + ": " + e.getMessage());
                }
            }
        }

        return result;
    }



    private OrcamentoDTO toDTO(OrcamentoModel orcamentoModel) {

        OrcamentoDTO orcamentoDTO = new OrcamentoDTO();
        orcamentoDTO.setOrcamentoID(orcamentoModel.getOrcamentoID());
        orcamentoDTO.setDescricao(orcamentoModel.getDescricao());
        orcamentoDTO.setValor(orcamentoModel.getValor());
        orcamentoDTO.setMovimento(orcamentoModel.getMovimento());
        orcamentoDTO.setIdPrestador(orcamentoModel.getPrestador().getCodPrestador());
        orcamentoDTO.setEmpresaID(orcamentoModel.getEmpresa().getIdEmpresa());
        orcamentoDTO.setDesconto(orcamentoModel.getDesconto());
        orcamentoDTO.setValorTotalItens(orcamentoModel.getValorTotalItens());
        orcamentoDTO.setValorFinal(orcamentoModel.getValorFinal());
        orcamentoDTO.setTipoPagamento(orcamentoModel.getTipoPagamento());
        
        // Converter itens
        if (orcamentoModel.getItens() != null) {
            List<OrcamentoItemDTO> itensDTO = orcamentoModel.getItens().stream()
                .map(item -> {
                    ItemModel itemModel = item.getItem();
                    Float valorOriginal = itemModel.getValorUnitario();
                    Float valorComDesconto = item.getValorUnitario();
                    
                    OrcamentoItemDTO dto = new OrcamentoItemDTO();
                    dto.setIdOrcamentoItem(item.getIdOrcamentoItem());
                    dto.setItemId(itemModel.getIdItem());
                    dto.setItemNome(itemModel.getNome());
                    dto.setDescricao(itemModel.getDescricao());
                    dto.setTipoUnitario(itemModel.getTipoUnitario() != null ? itemModel.getTipoUnitario().name() : "UNIDADE");
                    dto.setPrecoMedio(itemModel.getPrecoMedio());
                    dto.setValorUnitarioOriginal(valorOriginal);
                    // Se o valor unitário for diferente do original, significa que houve desconto aplicado pelo backend
                    dto.setValorComDesconto(!valorOriginal.equals(valorComDesconto) ? valorComDesconto : null);
                    dto.setQuantidade(item.getQuantidade());
                    dto.setValorUnitario(item.getValorUnitario());
                    dto.setValorTotal(item.getValorTotal());
                    
                    return dto;
                })
                .collect(Collectors.toList());
            orcamentoDTO.setItens(itensDTO);
        }

        // Converter imagens
        if (orcamentoModel.getImagens() != null) {
            List<OrcamentoImagemDTO> imagensDTO = orcamentoModel.getImagens().stream()
                .map(imagem -> new OrcamentoImagemDTO(
                    imagem.getIdImagem(),
                    imagem.getNomeArquivo(),
                    imagem.getTipoArquivo(),
                    imagem.getTamanhoArquivo(),
                    "/api/orcamento/" + orcamentoModel.getOrcamentoID() + "/imagens/" + imagem.getIdImagem(),
                    imagem.getDataUpload()
                ))
                .collect(Collectors.toList());
            orcamentoDTO.setImagens(imagensDTO);
        }

        // Preencher campo analistaOrcamento com o username do criador
        if (orcamentoModel.getUsuarioCriador() != null) {
            orcamentoDTO.setAnalistaOrcamento(orcamentoModel.getUsuarioCriador().getUsername());
        }

        return orcamentoDTO;
    }

    // Métodos para upload de imagens
    @Transactional
    public OrcamentoImagemDTO salvarImagem(Long orcamentoID, MultipartFile file) throws IOException {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // Buscar orçamento (usar findById para verificar se existe)
        OrcamentoModel orcamentoModel = orcamentoRepository.findById(orcamentoID)
                .orElseThrow(() -> new RuntimeException("Orçamento não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para adicionar imagens a este orçamento");
        }

        // Validar tipo de arquivo
        if (!fileUploadService.isImagem(file.getContentType())) {
            throw new RuntimeException("Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)");
        }

        // Salvar arquivo
        String caminhoArquivo = fileUploadService.salvarArquivo(file, orcamentoID);

        // Criar registro no banco
        OrcamentoImagemModel imagemModel = new OrcamentoImagemModel();
        imagemModel.setOrcamento(orcamentoModel);
        imagemModel.setNomeArquivo(file.getOriginalFilename());
        imagemModel.setTipoArquivo(file.getContentType());
        imagemModel.setTamanhoArquivo(file.getSize());
        imagemModel.setCaminhoArquivo(caminhoArquivo);

        orcamentoImagemRepository.save(imagemModel);

        return new OrcamentoImagemDTO(
            imagemModel.getIdImagem(),
            imagemModel.getNomeArquivo(),
            imagemModel.getTipoArquivo(),
            imagemModel.getTamanhoArquivo(),
            "/api/orcamento/" + orcamentoID + "/imagens/" + imagemModel.getIdImagem(),
            imagemModel.getDataUpload()
        );
    }

    public List<OrcamentoImagemDTO> listarImagens(Long orcamentoID) {
        return orcamentoImagemRepository.findByOrcamento_OrcamentoID(orcamentoID)
                .stream()
                .map(imagem -> new OrcamentoImagemDTO(
                    imagem.getIdImagem(),
                    imagem.getNomeArquivo(),
                    imagem.getTipoArquivo(),
                    imagem.getTamanhoArquivo(),
                    "/api/orcamento/" + orcamentoID + "/imagens/" + imagem.getIdImagem(),
                    imagem.getDataUpload()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletarImagem(Long orcamentoID, Long imagemID) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        // Buscar orçamento (usar findById para verificar se existe)
        OrcamentoModel orcamentoModel = orcamentoRepository.findById(orcamentoID)
                .orElseThrow(() -> new RuntimeException("Orçamento não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar imagens deste orçamento");
        }

        OrcamentoImagemModel imagem = orcamentoImagemRepository.findById(imagemID)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        if (!imagem.getOrcamento().getOrcamentoID().equals(orcamentoID)) {
            throw new RuntimeException("Imagem não pertence a este orçamento");
        }

        // Deletar arquivo físico
        fileUploadService.deletarArquivo(imagem.getCaminhoArquivo());

        // Deletar registro do banco
        orcamentoImagemRepository.delete(imagem);
    }

    public OrcamentoImagemDTO obterImagem(Long orcamentoID, Long imagemID) {
        OrcamentoImagemModel imagem = orcamentoImagemRepository.findById(imagemID)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));

        if (!imagem.getOrcamento().getOrcamentoID().equals(orcamentoID)) {
            throw new RuntimeException("Imagem não pertence a este orçamento");
        }

        return new OrcamentoImagemDTO(
            imagem.getIdImagem(),
            imagem.getNomeArquivo(),
            imagem.getTipoArquivo(),
            imagem.getTamanhoArquivo(),
            imagem.getCaminhoArquivo(),
            imagem.getDataUpload()
        );
    }

    public byte[] carregarImagem(OrcamentoImagemDTO imagem) throws IOException {
        return fileUploadService.carregarArquivo(imagem.getUrlImagem());
    }

    public OrcamentoCompletoDTO buscarOrcamentoCompleto(Long orcamentoID) {
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        OrcamentoModel orcamentoModel = orcamentoRepository
                .findById(orcamentoID)
                .orElseThrow(() -> new RuntimeException("Orçamento não encontrado"));

        // Verifica se o usuário é ADMIN/EXPANSAO ou se criou o orçamento
        if (!authenticationUtil.hasFullDataAccess() && !orcamentoModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar este orçamento");
        }

        return OrcamentoCompletoDTO.fromModel(orcamentoModel);
    }

}
