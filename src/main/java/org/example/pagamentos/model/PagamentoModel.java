package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@AllArgsConstructor @NoArgsConstructor
@Getter @Setter
@Entity
@Table(name = "PAGAMENTOS")
public class PagamentoModel {

    @Id @Column(name = "PAGAMENTO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pagamentoID;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOLICITACAO_APROVACAO", nullable = false)
    private SolicitacaoAprovacaoModel solicitacaoAprovacao;

    @Column(name = "MOVIMENTO")
    private LocalDate movimento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COD_PRESTADOR", nullable = false)
    private PrestadorModel prestador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DADOS_BANCARIO_ID", nullable = false)
    private Dados_BancariosModel dadosBancarios;
}
