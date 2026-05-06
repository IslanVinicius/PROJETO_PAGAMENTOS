import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import styles from './TabelaOrcamentos.module.css';

/**
 * Componente TabelaOrcamentos - Tabela profissional de últimos orçamentos
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados da tabela [{orcamentoId, prestador, valor, status, data}]
 * @param {boolean} props.loading - Estado de loading
 */
function TabelaOrcamentos({ data = [], loading = false }) {
    const [sortConfig, setSortConfig] = useState({ key: 'data', direction: 'desc' });

    // Ordenar dados
    const sortedData = React.useMemo(() => {
        if (!data || data.length === 0) return [];
        
        const sortableItems = [...data];
        sortableItems.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            // Converter valores para comparação adequada
            if (sortConfig.key === 'valor') {
                aValue = Number(aValue) || 0;
                bValue = Number(bValue) || 0;
            } else if (sortConfig.key === 'data') {
                // Tentar converter datas para comparação
                aValue = new Date(parseDataParaComparacao(aValue));
                bValue = new Date(parseDataParaComparacao(bValue));
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            return <ArrowUpDown size={14} className={styles.sortIconInactive} />;
        }
        return (
            <ArrowUpDown 
                size={14} 
                className={`${styles.sortIconActive} ${sortConfig.direction === 'asc' ? styles.sortAsc : styles.sortDesc}`} 
            />
        );
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>Últimos Orçamentos</h3>
            </div>
            
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.skeleton}></div>
                </div>
            ) : sortedData.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Nenhum orçamento encontrado</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('prestador')} className={styles.sortable}>
                                    <span>Prestador</span>
                                    {getSortIcon('prestador')}
                                </th>
                                <th onClick={() => requestSort('valor')} className={styles.sortable}>
                                    <span>Valor</span>
                                    {getSortIcon('valor')}
                                </th>
                                <th onClick={() => requestSort('status')} className={styles.sortable}>
                                    <span>Status</span>
                                    {getSortIcon('status')}
                                </th>
                                <th onClick={() => requestSort('data')} className={styles.sortable}>
                                    <span>Data</span>
                                    {getSortIcon('data')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData.map((item) => (
                                <tr key={item.orcamentoId}>
                                    <td className={styles.prestadorCell}>{item.prestador}</td>
                                    <td className={styles.valorCell}>{formatarMoeda(item.valor)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[`badge${item.status.toLowerCase()}`]}`}>
                                            {formatarStatus(item.status)}
                                        </span>
                                    </td>
                                    <td className={styles.dataCell}>{item.data}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
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

/**
 * Converte data para formato comparável
 */
function parseDataParaComparacao(dataStr) {
    if (!dataStr) return '';
    
    // Se já estiver no formato ISO, retorna direto
    if (dataStr.includes('T')) return dataStr;
    
    // Tenta converter de DD/MM/YYYY
    try {
        const [dia, mes, ano] = dataStr.split('/');
        return `${ano}-${mes}-${dia}`;
    } catch (error) {
        return dataStr;
    }
}

export default TabelaOrcamentos;
