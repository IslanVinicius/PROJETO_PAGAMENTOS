import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './GraficoStatus.module.css';

// Cores para cada status
const COLORS = {
    APROVADO: '#10b981',
    PENDENTE: '#f59e0b',
    REJEITADO: '#ef4444'
};

/**
 * Componente GraficoStatus - Gráfico de pizza mostrando distribuição por status
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados para o gráfico [{status, quantidade, percentual}]
 * @param {boolean} props.loading - Estado de loading
 */
function GraficoStatus({ data = [], loading = false }) {
    // Preparar dados para o gráfico
    const chartData = data.map(item => ({
        ...item,
        nome: formatarStatus(item.status),
        cor: COLORS[item.status] || '#94a3b8'
    }));

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
                <h3 className={styles.chartTitle}>Distribuição por Status</h3>
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
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="quantidade"
                            nameKey="nome"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span style={{ color: '#475569', fontSize: '13px' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

/**
 * Tooltip personalizado para o gráfico
 */
function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        
        return (
            <div className={styles.tooltip}>
                <p className={styles.tooltipLabel}>{data.nome}</p>
                <p className={styles.tooltipValue}>
                    <strong>Quantidade:</strong> {data.quantidade}
                </p>
                <p className={styles.tooltipValue}>
                    <strong>Percentual:</strong> {data.percentual.toFixed(1)}%
                </p>
            </div>
        );
    }
    
    return null;
}

/**
 * Formata o status para exibição
 */
function formatarStatus(status) {
    const map = {
        'APROVADO': 'Aprovado',
        'PENDENTE': 'Pendente',
        'REJEITADO': 'Rejeitado'
    };
    
    return map[status] || status;
}

export default GraficoStatus;
