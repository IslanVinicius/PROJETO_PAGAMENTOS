package org.example.pagamentos.Enums;

public enum TipoUnitario {
    UNIDADE("Unidade", "un"),
    METRO_CUBICO("Metro Cúbico", "m³"),
    METRO_QUADRADO("Metro Quadrado", "m²"),
    METRO("Metro", "m"),
    CENTIMETRO("Centímetro", "cm"),
    QUILOGRAMA("Quilograma", "kg"),
    GRAMA("Grama", "g"),
    LITRO("Litro", "L"),
    MILILITRO("Mililitro", "ml"),
    PACOTE("Pacote", "pct"),
    CAIXA("Caixa", "cx"),
    GALAO("Galão", "gal"),
    TAMBOR("Tambor", "tmb"),
    ROLO("Rolo", "rl"),
    PAR("Par", "par");

    private final String descricao;
    private final String simbolo;

    TipoUnitario(String descricao, String simbolo) {
        this.descricao = descricao;
        this.simbolo = simbolo;
    }

    public String getDescricao() {
        return descricao;
    }

    public String getSimbolo() {
        return simbolo;
    }
}
