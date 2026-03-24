package org.example.pagamentos.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrcamentoImagemDTO {
    private Long idImagem;
    private String nomeArquivo;
    private String tipoArquivo;
    private Long tamanhoArquivo;
    private String urlImagem;
    private LocalDateTime dataUpload;
}
