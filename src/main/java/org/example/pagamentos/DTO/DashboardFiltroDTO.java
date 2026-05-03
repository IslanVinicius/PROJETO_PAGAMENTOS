package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardFiltroDTO {
    private String dataInicio;
    private String dataFim;
    private Set<Long> empresaIds;
    private Set<Long> prestadorIds;
    private Set<Long> usuarioIds;
    private Set<String> tiposPagamento;
}
