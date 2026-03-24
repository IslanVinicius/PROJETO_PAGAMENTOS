package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @NotNull(message = "O ID do grupo é obrigatório")
    private Long idGrupo;
}
