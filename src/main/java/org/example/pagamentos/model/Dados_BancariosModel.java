package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Entity
@Table(name = "DADOS_BANCARIOS_PRESTADOR")
public class Dados_BancariosModel {


    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DADOS_BANCARIO_ID")
    private Long id;

    @OneToOne
    @JoinColumn(name = "COD_PRESTADOR",nullable = false,unique = true)
    private PrestadorModel prestadorModel;

    @Column(name = "BANCO")
    private String banco;

    @Column(name = "TIPO_CONTA")
    private String tipoConta;

    @Column(name = "AGENCIA")
    private String agencia;

    @Column(name = "CONTA")
    private String conta;

    @Column(name = "CHAVE_PIX")
    private String chavePix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_criador_id", nullable = false)
    private Usuario usuarioCriador;

}
