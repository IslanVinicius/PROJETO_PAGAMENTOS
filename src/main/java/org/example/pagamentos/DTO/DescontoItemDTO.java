package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DescontoItemDTO {
    private Long idDesconto;
    private Integer quantidadeMinima;
    private Float percentualDesconto;
    private Float valorFinal;
    private String descricao;
}
