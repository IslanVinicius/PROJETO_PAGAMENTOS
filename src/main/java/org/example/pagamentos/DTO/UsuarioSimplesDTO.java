package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO simples para listar usuários em selects/filtros
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioSimplesDTO {
    private Long id;
    private String username;
}
