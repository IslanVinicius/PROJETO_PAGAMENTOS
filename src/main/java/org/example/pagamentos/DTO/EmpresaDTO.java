package org.example.pagamentos.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class EmpresaDTO {

    private Long idEmpresa;

    @NotBlank(message = "Nome é obrigat[orio")
    private String nome;

    @NotBlank(message = "CNPJ é obrigatório")
    private String cnpj;

    private String razao;

}
