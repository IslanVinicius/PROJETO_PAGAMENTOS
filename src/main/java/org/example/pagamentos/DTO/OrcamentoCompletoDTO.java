package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.model.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoCompletoDTO {
    private Long orcamentoID;
    private LocalDate movimento;
    private String descricao;
    private Float valor;
    private Float valorTotalItens;
    private Float desconto;
    private Float valorFinal;
    private String tipoPagamento;
    
    // Prestador
    private Long idPrestador;
    private String nomePrestador;
    private String cpfPrestador;
    private Dados_BancariosDTO dadosBancarios;
    
    // Empresa
    private Long empresaID;
    private String nomeEmpresa;
    private String cnpjEmpresa;
    private String razaoEmpresa;
    private EnderecoDTO enderecoEmpresa;
    
    // Itens
    private List<OrcamentoItemDTO> itens;
    
    // Usuário solicitante
    private String nomeSolicitante;
    private String usernameSolicitante;
    
    public static OrcamentoCompletoDTO fromModel(OrcamentoModel orcamento) {
        OrcamentoCompletoDTO dto = new OrcamentoCompletoDTO();
        
        dto.setOrcamentoID(orcamento.getOrcamentoID());
        dto.setMovimento(orcamento.getMovimento());
        dto.setDescricao(orcamento.getDescricao());
        dto.setValor(orcamento.getValor());
        dto.setValorTotalItens(orcamento.getValorTotalItens());
        dto.setDesconto(orcamento.getDesconto());
        dto.setValorFinal(orcamento.getValorFinal());
        dto.setTipoPagamento(orcamento.getTipoPagamento() != null ? 
            orcamento.getTipoPagamento().getDescricao() : "");
        
        // Prestador
        PrestadorModel prestador = orcamento.getPrestador();
        if (prestador != null) {
            dto.setIdPrestador(prestador.getCodPrestador());
            dto.setNomePrestador(prestador.getNome());
            dto.setCpfPrestador(prestador.getCpf());
            
            // Dados bancários - usar getter
            if (prestador.getDadosBancarios() != null) {
                Dados_BancariosModel dadosBancarios = prestador.getDadosBancarios();
                dto.setDadosBancarios(new Dados_BancariosDTO(
                    dadosBancarios.getId(),
                    prestador.getCodPrestador(),
                    dadosBancarios.getBanco(),
                    dadosBancarios.getTipoConta(),
                    dadosBancarios.getAgencia(),
                    dadosBancarios.getConta(),
                    dadosBancarios.getChavePix()
                ));
            }
        }
        
        // Empresa
        EmpresaModel empresa = orcamento.getEmpresa();
        if (empresa != null) {
            dto.setEmpresaID(empresa.getIdEmpresa());
            dto.setNomeEmpresa(empresa.getNome());
            dto.setCnpjEmpresa(empresa.getCnpj());
            dto.setRazaoEmpresa(empresa.getRazao());
            
            // Endereço (primeiro endereço da empresa)
            if (empresa.getEnderecos() != null && !empresa.getEnderecos().isEmpty()) {
                EnderecoModel endereco = empresa.getEnderecos().get(0);
                dto.setEnderecoEmpresa(new EnderecoDTO(
                    endereco.getIdEndereco(),
                    endereco.getCep(),
                    endereco.getLogradouro(),
                    endereco.getNumero(),
                    endereco.getComplemento(),
                    endereco.getBairro(),
                    endereco.getCidade(),
                    endereco.getEstado(),
                    empresa.getIdEmpresa(),
                    empresa.getNome()
                ));
            }
        }
        
        // Itens
        if (orcamento.getItens() != null) {
            dto.setItens(orcamento.getItens().stream()
                .map(item -> {
                    ItemModel itemModel = item.getItem();
                    Float valorOriginal = itemModel.getValorUnitario();
                    Float valorComDesconto = item.getValorUnitario();
                    
                    OrcamentoItemDTO itemDTO = new OrcamentoItemDTO();
                    itemDTO.setIdOrcamentoItem(item.getIdOrcamentoItem());
                    itemDTO.setItemId(itemModel.getIdItem());
                    itemDTO.setItemNome(itemModel.getNome());
                    itemDTO.setDescricao(itemModel.getDescricao());
                    itemDTO.setTipoUnitario(itemModel.getTipoUnitario() != null ? itemModel.getTipoUnitario().name() : "UNIDADE");
                    itemDTO.setPrecoMedio(itemModel.getPrecoMedio());
                    itemDTO.setValorUnitarioOriginal(valorOriginal);
                    // Se o valor unitário for diferente do original, significa que houve desconto aplicado pelo backend
                    itemDTO.setValorComDesconto(!valorOriginal.equals(valorComDesconto) ? valorComDesconto : null);
                    itemDTO.setQuantidade(item.getQuantidade());
                    itemDTO.setValorUnitario(item.getValorUnitario());
                    itemDTO.setValorTotal(item.getValorTotal());
                    
                    return itemDTO;
                })
                .toList());
        }
        
        // Solicitante
        if (orcamento.getUsuarioCriador() != null) {
            dto.setNomeSolicitante(orcamento.getUsuarioCriador().getUsername());
            dto.setUsernameSolicitante(orcamento.getUsuarioCriador().getUsername());
        }
        
        return dto;
    }
}
