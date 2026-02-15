
package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.Enums.StatusSolicitacao;

import java.time.LocalDate;

@NoArgsConstructor @AllArgsConstructor
@Getter @Setter
public class SolicitacaoAprovacaoDTO {

    @NotBlank
    private Long solicitacaoAprovacaoId;

    @NotBlank
    private LocalDate movimento;

    @NotBlank
    private Long orcamentoId;

    private StatusSolicitacao statusSolicitacao;
}
