package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO simples para listar empresas em selects/filtros
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaSimplesDTO {
    private Long id;
    private String nome;
}
