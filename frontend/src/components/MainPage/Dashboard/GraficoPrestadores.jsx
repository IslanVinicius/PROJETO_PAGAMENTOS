import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './GraficoPrestadores.module.css';

/**
 * Componente GraficoPrestadores - Gráfico de barras mostrando ranking de prestadores
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados para o gráfico [{prestadorId, nome, valorTotal, quantidade}]
 * @param {boolean} props.loading - Estado de loading
 */
function GraficoPrestadores({ data = [], loading = false }) {
    // Ordenar por valor total (maior para menor) e limitar a 10
    const chartData = data
        .sort((a, b) => b.valorTotal - a.valorTotal)
        .slice(0, 10)
        .map(item => ({
            ...item,
            nomeCurto: truncarNome(item.nome),
            valorFormatado: formatarMoeda(item.valorTotal)
        }));

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Ranking de Prestadores</h3>
                <span className={styles.subtitle}>Top 10 por valor total</span>
            </div>
            
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.skeleton}></div>
                </div>
            ) : chartData.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Nenhum dado disponível para o período selecionado</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                        data={chartData} 
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis 
                            type="number"
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(value) => formatarEixoX(value)}
                        />
                        <YAxis 
                            type="category"
                            dataKey="nomeCurto"
                            stroke="#64748b"
                            fontSize={11}
                            width={80}
                            tick={{ fill: '#475569' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="valorTotal" 
                            fill="#3b82f6"
                            radius={[0, 4, 4, 0]}
                            name="Valor Total"
                        />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/**
 * Tooltip personalizado para o gráfico
 */
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{data.nome}</p>
                <p className={styles.tooltipValue}>
                    <strong>Valor:</strong> {data.valorFormatado}
                </p>
                <p className={styles.tooltipValue}>
                    <strong>Orçamentos:</strong> {data.quantidade}
                </p>
            </div>
        );
    }
    
    return null;
}

/**
 * Trunca nome muito longo
 */
function truncarNome(nome, maxLength = 20) {
    if (!nome || nome.length <= maxLength) return nome;
    return nome.substring(0, maxLength) + '...';
}

/**
 * Formata valores do eixo X
 */
function formatarEixoX(value) {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
}

/**
 * Formata valor em moeda
 */
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor || 0);
}

export default GraficoPrestadores;
