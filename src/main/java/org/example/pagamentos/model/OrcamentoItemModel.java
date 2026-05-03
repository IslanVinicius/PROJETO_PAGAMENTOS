package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ORCAMENTO_ITENS")
public class OrcamentoItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ORCAMENTO_ITEM")
    @Getter
    private Long idOrcamentoItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORCAMENTO_ID", nullable = false)
    @Getter
    @Setter
    private OrcamentoModel orcamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ITEM_ID", nullable = true) // nullable = true para suportar itens manuais
    @Getter
    @Setter
    private ItemModel item;

    @Column(name = "DESCRICAO_MANUAL", length = 500)
    @Getter
    @Setter
    private String descricaoManual;

    @Column(name = "NOME_MANUAL", length = 200)
    @Getter
    @Setter
    private String nomeManual;

    @Column(name = "TIPO_UNITARIO_MANUAL", length = 50)
    @Getter
    @Setter
    private String tipoUnitarioManual;

    @Column(name = "QUANTIDADE", nullable = false)
    @Getter
    @Setter
    private Integer quantidade;

    @Column(name = "VALOR_UNITARIO", nullable = false)
    @Getter
    @Setter
    private Float valorUnitario;

    @Column(name = "VALOR_TOTAL")
    @Getter
    @Setter
    private Float valorTotal;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (this.quantidade != null && this.valorUnitario != null) {
            this.valorTotal = this.quantidade * this.valorUnitario;
        }
    }
}
