import React from 'react';
import styles from './ResultadosPesquisa.module.css';

/**
 * Componente para exibir resultados de pesquisa
 * @param {Object} props
 * @param {Array} props.resultados - Array de resultados
 * @param {boolean} props.mostrar - Se deve mostrar os resultados
 * @param {function} props.onSelecionar - Callback ao selecionar um item
 * @param {Array} props.colunas - Array de { campo, label, format } para exibição
 * @param {string} props.mensagemVazio - Mensagem quando não há resultados
 */
export function ResultadosPesquisa({
    resultados,
    mostrar,
    onSelecionar,
    colunas = [],
    mensagemVazio = 'Nenhum resultado encontrado'
}) {
    if (!mostrar) return null;

    const formatarValor = (valor, format) => {
        if (format === 'data' && valor) {
            return new Date(valor).toLocaleDateString('pt-BR');
        }
        if (format === 'moeda' && valor !== undefined) {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(valor);
        }
        return valor || '-';
    };

    return (
        <div className={styles.resultadosContainer}>
            {resultados.length > 0 ? (
                <div className={styles.resultadosTable}>
                    <table>
                        <thead>
                            <tr>
                                {colunas.map((col) => (
                                    <th key={col.campo}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {resultados.map((item, index) => (
                                <tr
                                    key={item.id || index}
                                    onClick={() => onSelecionar(item)}
                                    className={styles.resultadoRow}
                                >
                                    {colunas.map((col) => (
                                        <td key={col.campo}>
                                            {formatarValor(item[col.campo], col.format)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className={styles.semResultados}>
                    {mensagemVazio}
                </div>
            )}
        </div>
    );
}

export default ResultadosPesquisa;
