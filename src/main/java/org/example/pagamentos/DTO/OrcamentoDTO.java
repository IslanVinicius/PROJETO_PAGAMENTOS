package org.example.pagamentos.DTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.Enums.TipoPagamento;
import org.example.pagamentos.model.EmpresaModel;

import java.time.LocalDate;
import java.util.List;

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

    private Float valorTotalItens;

    private Float desconto;

    private Float valorFinal;

    private TipoPagamento tipoPagamento;

    private List<OrcamentoItemDTO> itens;

    private List<OrcamentoImagemDTO> imagens;

}
