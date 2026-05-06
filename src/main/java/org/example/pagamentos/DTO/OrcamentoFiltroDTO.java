package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoFiltroDTO {
    private String dataInicio;
    private String dataFim;
    private Long usuarioCriadorId;
    private Long prestadorId;
    private Long empresaId;
    private String descricao;
    private String tipoPagamento;
    private Float valorMin;
    private Float valorMax;
    
    // Paginação
    private Integer page = 0;
    private Integer size = 10;
    
    // Ordenação
    private String sortBy = "movimento";
    private String sortDirection = "desc"; // asc ou desc
}
