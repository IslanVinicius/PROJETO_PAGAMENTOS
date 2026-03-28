package org.example.pagamentos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ENDEREÇOS")
public class EnderecoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Getter @Setter
    private Long idEndereco;

    @Getter @Setter
    @Column(name = "CEP", nullable = false, length = 9)
    private String cep;

    @Getter @Setter
    @Column(name = "LOGRADOURO", nullable = false, length = 100)
    private String logradouro;

    @Getter @Setter
    @Column(name = "NUMERO", nullable = false, length = 10)
    private String numero;

    @Getter @Setter
    @Column(name = "COMPLEMENTO", length = 50)
    private String complemento;

    @Getter @Setter
    @Column(name = "BAIRRO", nullable = false, length = 50)
    private String bairro;

    @Getter @Setter
    @Column(name = "CIDADE", nullable = false, length = 50)
    private String cidade;

    @Getter @Setter
    @Column(name = "ESTADO", nullable = false, length = 2)
    private String estado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id")
    @Getter @Setter
    private EmpresaModel empresa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_criador_id", nullable = false)
    @Getter @Setter
    private Usuario usuarioCriador;
}
