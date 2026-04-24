package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DESCONTO_ITEM")
public class DescontoItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DESCONTO")
    @Getter
    private Long idDesconto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_ITEM", nullable = false)
    @Getter
    @Setter
    private ItemModel item;

    @Column(name = "QUANTIDADE_MINIMA", nullable = false)
    @Getter
    @Setter
    private Integer quantidadeMinima;

    @Column(name = "PERCENTUAL_DESCONTO")
    @Getter
    @Setter
    private Float percentualDesconto;

    @Column(name = "VALOR_FINAL")
    @Getter
    @Setter
    private Float valorFinal;

    @Column(name = "DESCRICAO")
    @Getter
    @Setter
    private String descricao;
}
