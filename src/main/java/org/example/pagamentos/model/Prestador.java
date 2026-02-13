package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "PRESTADORES")
public class Prestador {


    @Id @Getter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer cod_prestador;

    @Getter @Setter
    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Getter @Setter
    @Column(name = "CPF", nullable = false, unique = true)
    private String cpf;

    @OneToOne(mappedBy = "prestador", cascade = CascadeType.ALL)
    private Dados_Bancarios_Prestador dados_bancarios_prestador;

}
