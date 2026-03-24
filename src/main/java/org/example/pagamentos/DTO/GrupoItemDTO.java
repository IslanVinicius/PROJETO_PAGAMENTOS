package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GrupoItemDTO {

    private Long idGrupo;

    @NotBlank(message = "O nome do grupo é obrigatório")
    private String nome;

    private String descricao;

    private List<ItemDTO> itens;
}
