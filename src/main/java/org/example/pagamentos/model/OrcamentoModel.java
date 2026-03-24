package org.example.pagamentos.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.example.pagamentos.Enums.TipoPagamento;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ORCAMENTOS")
public class OrcamentoModel {

    @Id @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orcamentoID;

    @Getter @Setter
    @Column(name = "MOVIMENTO", nullable = false) @JsonFormat(pattern = "dd/MM/yyyy")
    private LocalDate movimento;

    @ManyToOne @JoinColumn(name = "ENTIDADE", nullable = false)
    @Getter @Setter
    private EmpresaModel empresa;

    @ManyToOne @JoinColumn(name = "COD_PRESTADOR", nullable = false)
    @Getter @Setter
    private PrestadorModel prestador;

    @Getter @Setter
    @Column(name = "DESCRICAO")
    private String descricao;

    @Getter @Setter
    @Column(name = "VALOR")
    private Float valor;

    @Getter @Setter
    @Column(name = "VALOR_TOTAL_ITENS")
    private Float valorTotalItens;

    @Getter @Setter
    @Column(name = "DESCONTO")
    private Float desconto;

    @Getter @Setter
    @Column(name = "VALOR_FINAL")
    private Float valorFinal;

    @Getter @Setter
    @Enumerated(EnumType.STRING)
    @Column(name = "TIPO_PAGAMENTO")
    private TipoPagamento tipoPagamento;

    @OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Getter
    @Setter
    private List<OrcamentoItemModel> itens = new ArrayList<>();

    @OneToMany(mappedBy = "orcamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @Getter
    @Setter
    private List<OrcamentoImagemModel> imagens = new ArrayList<>();

    @OneToOne(mappedBy = "orcamento")
    private SolicitacaoAprovacaoModel solicitacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_criador_id", nullable = false)
    @Getter @Setter
    private Usuario usuarioCriador;

    public void calcularTotais() {
        float total = 0f;
        if (itens != null) {
            for (OrcamentoItemModel item : itens) {
                if (item.getValorTotal() != null) {
                    total += item.getValorTotal();
                }
            }
        }
        this.valorTotalItens = total;
        
        float descontoValor = this.desconto != null ? this.desconto : 0f;
        this.valorFinal = total - descontoValor;
        
        // Se não houver descrição/itens, mantém o valor original
        if (this.valor == null || this.valor == 0) {
            this.valor = total;
        }
    }
}
