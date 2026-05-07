import React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import styles from './OrcamentosTable.module.css';

/**
 * Componente OrcamentosTable - Tabela profissional com ordenação e paginação
 * 
 * @param {Object} props
 * @param {Array} props.data - Dados da tabela
 * @param {boolean} props.loading - Estado de loading
 * @param {Object} props.sortConfig - Configuração de ordenação {key, direction}
 * @param {Function} props.onSort - Callback para ordenação
 * @param {Object} props.pagination - Configuração de paginação {page, size, totalElements, totalPages}
 * @param {Function} props.onPageChange - Callback para mudança de página
 * @param {Function} props.onPageSizeChange - Callback para mudança de tamanho da página
 */
function OrcamentosTable({ 
    data = [], 
    loading = false,
    sortConfig = { key: null, direction: 'asc' },
    onSort,
    pagination = { page: 0, size: 10, totalElements: 0, totalPages: 0 },
    onPageChange,
    onPageSizeChange
}) {
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarStatus = (tipo) => {
        const map = {
            'PIX': 'PIX',
            'BOLETO': 'Boleto',
            'TRANSFERENCIA': 'Transferência',
            'DINHEIRO': 'Dinheiro'
        };
        return map[tipo] || tipo;
    };

    const formatarStatusAprovacao = (status) => {
        const map = {
            'PENDENTE': 'Pendente',
            'APROVADO': 'Aprovado',
            'REJEITADO': 'Rejeitado'
        };
        return map[status] || status || 'Pendente';
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

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        onSort(key, direction);
    };

    // Calcular range de páginas para mostrar
    const getPageRange = () => {
        const current = pagination.page + 1;
        const total = pagination.totalPages;
        const delta = 2;
        const range = [];
        
        for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
            range.push(i);
        }
        
        return range;
    };

    // Garantir sempre 10 linhas visíveis na tabela
    const MIN_ROWS = 10;
    const displayData = React.useMemo(() => {
        if (data.length >= MIN_ROWS) {
            return data;
        }
        
        // Preencher com linhas vazias até atingir MIN_ROWS
        const paddedData = [...data];
        const emptyRowsNeeded = MIN_ROWS - data.length;
        
        for (let i = 0; i < emptyRowsNeeded; i++) {
            paddedData.push({
                orcamentoId: `empty-${i}`,
                movimento: '',
                usuarioCriador: '',
                prestador: '',
                empresa: '',
                descricao: '',
                tipoPagamento: '',
                valorFinal: 0,
                statusAprovacao: '', // Sem status para linhas vazias
                isEmpty: true
            });
        }
        
        return paddedData;
    }, [data]);

    return (
        <div className={styles.tableContainer}>
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.skeleton}></div>
                    <div className={styles.skeleton}></div>
                    <div className={styles.skeleton}></div>
                </div>
            ) : data.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Nenhum orçamento encontrado</p>
                </div>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('movimento')} className={styles.sortable}>
                                        <span>Movimento</span>
                                        {getSortIcon('movimento')}
                                    </th>
                                    <th onClick={() => handleSort('usuarioCriador')} className={styles.sortable}>
                                        <span>Usuário Criador</span>
                                        {getSortIcon('usuarioCriador')}
                                    </th>
                                    <th onClick={() => handleSort('prestador')} className={styles.sortable}>
                                        <span>Prestador</span>
                                        {getSortIcon('prestador')}
                                    </th>
                                    <th onClick={() => handleSort('empresa')} className={styles.sortable}>
                                        <span>Empresa</span>
                                        {getSortIcon('empresa')}
                                    </th>
                                    <th onClick={() => handleSort('descricao')} className={styles.sortable}>
                                        <span>Descrição</span>
                                        {getSortIcon('descricao')}
                                    </th>
                                    <th onClick={() => handleSort('tipoPagamento')} className={styles.sortable}>
                                        <span>Tipo Pagamento</span>
                                        {getSortIcon('tipoPagamento')}
                                    </th>
                                    <th onClick={() => handleSort('statusAprovacao')} className={styles.sortable}>
                                        <span>Status Aprovação</span>
                                        {getSortIcon('statusAprovacao')}
                                    </th>
                                    <th onClick={() => handleSort('valorFinal')} className={styles.sortable}>
                                        <span>Valor Final</span>
                                        {getSortIcon('valorFinal')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayData.map((item) => (
                                    <tr key={item.orcamentoId} className={item.isEmpty ? styles.emptyRow : ''}>
                                        <td>{item.movimento}</td>
                                        <td>{item.usuarioCriador}</td>
                                        <td>{item.prestador}</td>
                                        <td>{item.empresa}</td>
                                        <td className={styles.descricaoCell}>{item.descricao}</td>
                                        <td>
                                            {item.tipoPagamento ? (
                                                <span className={`${styles.badge} ${styles[`badge${item.tipoPagamento?.toLowerCase()}`]}`}>
                                                    {formatarStatus(item.tipoPagamento)}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                        <td>
                                            {!item.isEmpty && item.statusAprovacao ? (
                                                <span className={`${styles.badge} ${styles[`badgeStatus${item.statusAprovacao?.toLowerCase()}`]}`}>
                                                    {formatarStatusAprovacao(item.statusAprovacao)}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                        </td>
                                        <td className={styles.valorCell}>
                                            {item.valorFinal > 0 ? formatarMoeda(item.valorFinal) : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginação */}
                    <div className={styles.pagination}>
                        <div className={styles.paginationInfo}>
                            Mostrando {data.length} de {pagination.totalElements} registros
                        </div>
                        
                        <div className={styles.paginationControls}>
                            <div className={styles.pageSizeSelector}>
                                <label>Registros por página:</label>
                                <select 
                                    value={pagination.size}
                                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className={styles.pageButtons}>
                                <button 
                                    onClick={() => onPageChange(0)}
                                    disabled={pagination.page === 0}
                                    title="Primeira página"
                                >
                                    <ChevronsLeft size={18} />
                                </button>
                                <button 
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 0}
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                {/* Primeira página */}
                                {pagination.page + 1 > 3 && (
                                    <button onClick={() => onPageChange(0)}>1</button>
                                )}
                                {pagination.page + 1 > 3 && <span>...</span>}

                                {/* Páginas do meio */}
                                {getPageRange().map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum - 1)}
                                        className={pageNum === pagination.page + 1 ? styles.active : ''}
                                    >
                                        {pageNum}
                                    </button>
                                ))}

                                {/* Última página */}
                                {pagination.page + 1 < pagination.totalPages - 2 && <span>...</span>}
                                {pagination.page + 1 < pagination.totalPages - 2 && (
                                    <button onClick={() => onPageChange(pagination.totalPages - 1)}>
                                        {pagination.totalPages}
                                    </button>
                                )}

                                <button 
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    title="Próxima página"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <button 
                                    onClick={() => onPageChange(pagination.totalPages - 1)}
                                    disabled={pagination.page >= pagination.totalPages - 1}
                                    title="Última página"
                                >
                                    <ChevronsRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default OrcamentosTable;
