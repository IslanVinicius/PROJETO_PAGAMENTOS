package org.example.pagamentos.DTO;
import com.fasterxml.jackson.annotation.JsonFormat;
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

    private Long orcamentoID;
    @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate movimento;
    private Long idPrestador;
    private Long empresaID;
    private String empresaNome;
    private String descricao;
    private Float valor;

}
