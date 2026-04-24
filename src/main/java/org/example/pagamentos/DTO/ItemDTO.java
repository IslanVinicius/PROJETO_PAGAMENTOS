package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.Enums.TipoUnitario;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ItemDTO {

    private Long idItem;

    @NotBlank(message = "O nome do item é obrigatório")
    private String nome;

    private String descricao;

    private Float valorUnitario;

    private Float precoMedio;

    private TipoUnitario tipoUnitario;

    @NotNull(message = "O ID do grupo é obrigatório")
    private Long idGrupo;

    private List<DescontoItemDTO> descontos = new ArrayList<>();
}
