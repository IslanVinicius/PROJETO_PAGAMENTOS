import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import styles from './KpiCard.module.css';

/**
 * Componente KpiCard - Exibe um indicador chave de performance (KPI)
 * 
 * @param {Object} props
 * @param {string} props.title - Título do KPI
 * @param {string|number} props.value - Valor principal formatado
 * @param {React.ReactNode} props.icon - Ícone do KPI
 * @param {number} props.variation - Variação percentual em relação ao período anterior
 * @param {string} props.color - Cor do card (opcional)
 */
function KpiCard({ title, value, icon, variation = null, color }) {
    // Determina se a variação é positiva ou negativa
    const isPositive = variation >= 0;
    const variationColor = isPositive ? styles.positive : styles.negative;

    return (
        <div className={`${styles.kpiCard} ${color ? styles[color] : ''}`}>
            <div className={styles.kpiHeader}>
                <div className={styles.kpiIcon}>
                    {icon}
                </div>
                {variation !== null && (
                    <div className={`${styles.variation} ${variationColor}`}>
                        {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span>{Math.abs(variation).toFixed(1)}%</span>
                    </div>
                )}
            </div>
            
            <div className={styles.kpiContent}>
                <span className={styles.kpiLabel}>{title}</span>
                <span className={styles.kpiValue}>{value}</span>
            </div>
        </div>
    );
}

export default KpiCard;
