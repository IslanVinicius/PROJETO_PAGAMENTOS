package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="EMPRESAS")
public class EmpresaModel {

    @Id @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ENTIDADE") @Getter
    Long idEmpresa;

    @Column(name = "NOME") @Getter @Setter
    String nome;

    @Column(name = "CNPJ") @Getter @Setter
    String cnpj;

    @Column(name = "RAZAO") @Getter @Setter
    String razao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_criador_id", nullable = false)
    @Getter @Setter
    Usuario usuarioCriador;
}
