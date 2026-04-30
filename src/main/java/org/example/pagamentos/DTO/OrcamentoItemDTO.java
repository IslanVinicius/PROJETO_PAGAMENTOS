package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoItemDTO {
    private Long idOrcamentoItem;
    private Long itemId;
    private String itemNome;
    private String descricao;
    private String tipoUnitario;
    private Float precoMedio;
    private Float valorUnitarioOriginal;
    private Float valorComDesconto;
    private Integer quantidade;
    private Float valorUnitario;
    private Float valorTotal;
    private String nomeManual; // Nome para itens manuais (quando itemId é null)
    private String descricaoManual; // Para itens manuais (quando itemId é null)
    private String tipoUnitarioManual; // Tipo unitário para itens manuais
}
