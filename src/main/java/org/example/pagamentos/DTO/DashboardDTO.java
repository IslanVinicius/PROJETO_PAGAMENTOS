package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    // KPIs principais
    private Integer totalOrcamentos;
    private Float valorTotal;
    private Float ticketMedio;
    
    // Dados para gráficos
    private List<Map<String, Object>> orcamentosPorEmpresa;
    private List<Map<String, Object>> orcamentosPorPrestador;
    private List<Map<String, Object>> orcamentosPorPeriodo;
    
    // Opções para filtros locais (drill-down)
    private List<Map<String, Object>> empresasDisponiveis;
    private List<Map<String, Object>> prestadoresDisponiveis;
    private List<String> tiposPagamentoDisponiveis;
}
