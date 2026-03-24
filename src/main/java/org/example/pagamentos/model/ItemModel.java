package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ITENS")
public class ItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_ITEM")
    @Getter
    private Long idItem;

    @Column(name = "NOME", nullable = false)
    @Getter
    @Setter
    private String nome;

    @Column(name = "DESCRICAO")
    @Getter
    @Setter
    private String descricao;

    @Column(name = "VALOR_UNITARIO")
    @Getter
    @Setter
    private Float valorUnitario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_GRUPO", nullable = false)
    @Getter
    @Setter
    private GrupoItemModel grupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_criador_id", nullable = false)
    @Getter
    @Setter
    private Usuario usuarioCriador;
}
