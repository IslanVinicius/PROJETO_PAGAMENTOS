package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor @AllArgsConstructor
@Entity
@Table(name = "PRESTADORES")
public class PrestadorModel {


    @Id @Getter  @Setter
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long codPrestador;

    @Getter @Setter
    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Getter @Setter
    @Column(name = "CPF", nullable = false, unique = true)
    private String cpf;

    @OneToOne(mappedBy = "prestadorModel", cascade = CascadeType.ALL)
    private Dados_BancariosModel dados_bancarios_model;

}
