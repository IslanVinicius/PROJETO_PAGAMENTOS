package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ORCAMENTO_IMAGENS")
public class OrcamentoImagemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_IMAGEM")
    @Getter
    private Long idImagem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORCAMENTO_ID", nullable = false)
    @Getter
    @Setter
    private OrcamentoModel orcamento;

    @Column(name = "NOME_ARQUIVO", nullable = false)
    @Getter
    @Setter
    private String nomeArquivo;

    @Column(name = "TIPO_ARQUIVO")
    @Getter
    @Setter
    private String tipoArquivo;

    @Column(name = "TAMANHO_ARQUIVO")
    @Getter
    @Setter
    private Long tamanhoArquivo;

    @Column(name = "CAMINHO_ARQUIVO", nullable = false)
    @Getter
    @Setter
    private String caminhoArquivo;

    @Column(name = "DATA_UPLOAD")
    @Getter
    @Setter
    private LocalDateTime dataUpload;

    @PrePersist
    public void prePersist() {
        this.dataUpload = LocalDateTime.now();
    }
}
