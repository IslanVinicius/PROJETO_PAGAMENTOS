package org.example.pagamentos.Enums;

public enum TipoPagamento {
    A_VISTA("À Vista"),
    ANTECIPADO("Antecipado"),
    CINQUENTA_CINQUENTA("50% - 50%");

    private final String descricao;

    TipoPagamento(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
