package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "DADOS_BANCARIOS_PRESTADOR")
public class Dados_BancariosModel {

    @Id @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DADOS_BANCARIO_ID")
    private Long id;

    @OneToOne @Getter @Setter
    @JoinColumn(name = "COD_PRESTADOR",nullable = false,unique = true)
    private PrestadorModel prestadorModel;

    @Getter @Setter @Column(name = "BANCO")
    private String banco;

    @Getter @Setter @Column(name = "TIPO_CONTA")
    private String tipoConta;

    @Getter @Setter @Column(name = "AGENCIA")
    private String agencia;

    @Getter @Setter @Column(name = "CONTA")
    private String conta;

    @Getter @Setter @Column(name = "CHAVE_PIX")
    private String chavePix;


}
