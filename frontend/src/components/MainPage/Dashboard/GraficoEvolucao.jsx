import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './GraficoEvolucao.module.css';

/**
 * Componente GraficoEvolucao - Gráfico de linha mostrando evolução temporal
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados para o gráfico [{data, valor, quantidade}]
 * @param {boolean} props.loading - Estado de loading
 */
function GraficoEvolucao({ data = [], loading = false }) {
    // Formatar dados para o gráfico
    const chartData = data.map(item => ({
        ...item,
        dataFormatada: formatarData(item.data),
        valorFormatado: formatarMoeda(item.valor)
    }));

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Evolução de Orçamentos</h3>
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
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                            dataKey="dataFormatada" 
                            stroke="#64748b"
                            fontSize={12}
                        />
                        <YAxis 
                            stroke="#64748b"
                            fontSize={12}
                            tickFormatter={(value) => formatarEixoY(value)}
                        />
                        <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="valor" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6, fill: '#2563eb' }}
                            name="Valor Total"
                        />
                    </LineChart>
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
                <p className={styles.tooltipLabel}>{label}</p>
                <p className={styles.tooltipValue}>
                    <strong>Valor:</strong> {data.valorFormatado}
                </p>
                <p className={styles.tooltipValue}>
                    <strong>Quantidade:</strong> {data.quantidade}
                </p>
            </div>
        );
    }
    
    return null;
}

/**
 * Formata a data para exibição
 */
function formatarData(dataStr) {
    if (!dataStr) return '';
    
    try {
        // Parse a data diretamente da string ISO (YYYY-MM-DD) sem conversão de timezone
        // Isso evita o problema de deslocamento de 1 dia devido ao fuso horário
        const [ano, mes, dia] = dataStr.split('-');
        
        // Retorna no formato DD/MM
        return `${dia}/${mes}`;
    } catch (error) {
        // Fallback: tenta usar Date se o formato não for esperado
        try {
            const data = new Date(dataStr + 'T00:00:00');
            return data.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        } catch (e) {
            return dataStr;
        }
    }
}

/**
 * Formata valores do eixo Y
 */
function formatarEixoY(value) {
    if (value >= 1000000) {
        return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return `R$ ${value}`;
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

export default GraficoEvolucao;
