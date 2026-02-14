package org.example.pagamentos.DTO;
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
    private LocalDate movimento;
    private Long empresaID;
    private String empresaNome;
    private String descricao;
    private Float valor;

}
