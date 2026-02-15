package org.example.pagamentos.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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
}
