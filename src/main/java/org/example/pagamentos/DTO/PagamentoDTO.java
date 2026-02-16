package org.example.pagamentos.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
public class PagamentoDTO {

    @NotBlank
    private Long pagamentoID;

    @NotBlank
    private Long solicitacaoID;

    @NotBlank @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate movimento;

    @NotBlank
    private Long prestadorID;

    @NotBlank
    private Long dadosBancariosID;
}
