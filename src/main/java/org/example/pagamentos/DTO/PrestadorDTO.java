package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter  @Setter
@NoArgsConstructor @AllArgsConstructor
public class PrestadorDTO {
    private Long cod_prestador;
    private String nome;
    private String cpf;
}
