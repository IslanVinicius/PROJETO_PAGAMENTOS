import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './common.module.css';

/**
 * Componente de Barra de Pesquisa
 * @param {string} termo - Valor do campo de pesquisa
 * @param {function} onTermoChange - Callback para mudança do termo
 * @param {string} campoSelecionado - Campo selecionado para pesquisa
 * @param {function} onCampoChange - Callback para mudança do campo
 * @param {Array} campos - Lista de campos disponíveis
 * @param {function} onPesquisar - Callback ao pesquisar
 * @param {function} onLimpar - Callback ao limpar
 * @param {boolean} desabilitado - Se a barra está desabilitada
 */
export function BarraPesquisa({
    termo,
    onTermoChange,
    campoSelecionado,
    onCampoChange,
    campos,
    onPesquisar,
    onLimpar,
    desabilitado = false
}) {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !desabilitado) {
            onPesquisar();
        }
    };

    return (
        <div className={styles.barraPesquisa}>
            <div className={styles.campoSelect}>
                <select
                    value={campoSelecionado}
                    onChange={(e) => onCampoChange(e.target.value)}
                    disabled={desabilitado}
                    className={styles.select}
                >
                    {campos.map((campo, index) => (
                        <option key={index} value={campo.campo}>
                            {campo.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={termo}
                    onChange={(e) => onTermoChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite para pesquisar..."
                    disabled={desabilitado}
                    className={styles.input}
                />
                <button
                    onClick={onPesquisar}
                    disabled={desabilitado || !termo.trim()}
                    className={styles.btnPesquisar}
                    title="Pesquisar"
                >
                    <Search size={18} />
                </button>
                <button
                    onClick={onLimpar}
                    disabled={desabilitado || !termo}
                    className={styles.btnLimpar}
                    title="Limpar"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}

/**
 * Componente de Resultados de Pesquisa
 * @param {Array} resultados - Lista de resultados
 * @param {boolean} mostrar - Se deve mostrar os resultados
 * @param {function} onSelecionar - Callback ao selecionar um resultado
 * @param {Array} colunas - Definição das colunas para exibição
 */
export function ResultadosPesquisa({
    resultados,
    mostrar,
    onSelecionar,
    colunas
}) {
    if (!mostrar || !resultados || resultados.length === 0) {
        return null;
    }

    return (
        <div className={styles.resultadosContainer}>
            <table className={styles.tabela}>
                <thead>
                    <tr>
                        {colunas.map((coluna, index) => (
                            <th key={index}>{coluna.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {resultados.map((item, index) => (
                        <tr
                            key={item.id || index}
                            onClick={() => onSelecionar(item)}
                            className={styles.linhaResultado}
                        >
                            {colunas.map((coluna, colIndex) => (
                                <td key={colIndex}>
                                    {item[coluna.campo] !== undefined ? item[coluna.campo] : '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
