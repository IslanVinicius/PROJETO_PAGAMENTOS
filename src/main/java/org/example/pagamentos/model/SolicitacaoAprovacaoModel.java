package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.example.pagamentos.Enums.StatusSolicitacao;

import java.time.LocalDate;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Entity
@Table(name = "SOLICITACOES_APROVACAO")
public class SolicitacaoAprovacaoModel {

    @Id @Column(name = "SOLICITACAO_APROVACAO")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long solicitacaoAprovacaoID;

    @Column(name = "MOVIMENTO")
    private LocalDate movimento;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orcamentoid", nullable = false)
    private OrcamentoModel orcamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "STATUS", nullable = false)
    private StatusSolicitacao statusSolicitacao;

    @OneToOne(mappedBy = "solicitacaoAprovacao")
    private PagamentoModel  pagamento;

    @PrePersist
    public void definirStatusPadrao() {
        if (statusSolicitacao == null) {
            statusSolicitacao = StatusSolicitacao.PENDENTE;
        }
    }
}
