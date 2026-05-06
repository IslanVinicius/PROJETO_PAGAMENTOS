package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoDashboardDTO {
    private Long orcamentoId;
    private String movimento; // Formato: dd/MM/yyyy
    private String usuarioCriador; // Nome do usuário
    private String prestador; // Nome do prestador
    private String empresa; // Nome da empresa
    private String descricao;
    private String tipoPagamento; // Enum convertido para String
    private Float valorFinal;
}
