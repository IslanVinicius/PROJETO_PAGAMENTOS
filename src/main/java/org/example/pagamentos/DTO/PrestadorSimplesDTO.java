package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO simples para listar prestadores em selects/filtros
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrestadorSimplesDTO {
    private Long id;
    private String nome;
}
