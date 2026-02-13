package org.example.pagamentos.DTO;
import lombok.Getter;
import lombok.Setter;
import org.example.pagamentos.model.EmpresaModel;

import java.time.LocalDate;

@Getter
@Setter
public class OrcamentoDTO {

    private Long orcamentoID;
    private LocalDate movimento;
    private EmpresaModel empresa;
    private String descricao;
    private Float valor;

}
