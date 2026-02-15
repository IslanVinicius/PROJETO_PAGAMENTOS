package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
public class Dados_BancariosDTO {

    @NotBlank(message = "ID é obrigatório")
    private Long dadosId;
    @NotBlank(message = "codPrestador é obrigatório")
    private Long codPrestador;

    private String banco;
    private String tipoConta;
    private String agencia;
    private String conta;
    private String chavePix;

}
