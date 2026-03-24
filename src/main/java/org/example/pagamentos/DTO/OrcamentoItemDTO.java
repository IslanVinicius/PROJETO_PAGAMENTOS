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
    private Integer quantidade;
    private Float valorUnitario;
    private Float valorTotal;
}
