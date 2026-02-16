package org.example.pagamentos.DTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.model.EmpresaModel;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor @AllArgsConstructor
public class OrcamentoDTO {
    @NotBlank
    private Long orcamentoID;

    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate movimento;

    @NotBlank
    private Long idPrestador;

    @NotBlank
    private Long empresaID;

    private String descricao;

    private Float valor;

}
