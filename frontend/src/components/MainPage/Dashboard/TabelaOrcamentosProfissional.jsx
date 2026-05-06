import React, { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import styles from './TabelaOrcamentosProfissional.module.css';
import { dashboardService } from '../../../services/dashboardService';
import OrcamentosFiltros from './OrcamentosFiltros';
import OrcamentosTable from './OrcamentosTable';

/**
 * Componente TabelaOrcamentosProfissional - Container principal da tabela avançada
 * Integra filtros, tabela e exportação CSV
 */
function TabelaOrcamentosProfissional() {
    // Estado dos filtros
    const [filtros, setFiltros] = useState({
        dataInicio: '',
        dataFim: '',
        usuarioCriadorId: null,
        prestadorId: null,
        empresaId: null,
        descricao: '',
        tipoPagamento: '',
        valorMin: null,
        valorMax: null
    });

    // Estado de paginação
    const [paginacao, setPaginacao] = useState({
        page: 0,
        size: 10
    });

    // Estado de ordenação
    const [sortConfig, setSortConfig] = useState({
        key: 'movimento',
        direction: 'desc'
    });

    // Debounce para filtros (300ms)
    const [filtrosDebounce, setFiltrosDebounce] = useState(filtros);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFiltrosDebounce(filtros);
            setPaginacao(prev => ({ ...prev, page: 0 })); // Resetar para primeira página
        }, 300);

        return () => clearTimeout(timer);
    }, [filtros]);

    // Query para buscar orçamentos
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['orcamentosDashboard', filtrosDebounce, paginacao, sortConfig],
        queryFn: () => dashboardService.buscarOrcamentos({
            ...filtrosDebounce,
            ...paginacao,
            sortBy: sortConfig.key,
            sortDirection: sortConfig.direction
        }),
        staleTime: 0, // Não usar cache para garantir dados atualizados
        retry: 2
    });

    // Handlers
    const handleFiltroChange = useCallback((campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    }, []);

    const handleLimparFiltros = useCallback(() => {
        setFiltros({
            dataInicio: '',
            dataFim: '',
            usuarioCriadorId: null,
            prestadorId: null,
            empresaId: null,
            descricao: '',
            tipoPagamento: '',
            valorMin: null,
            valorMax: null
        });
    }, []);

    const handleSort = useCallback((key, direction) => {
        setSortConfig({ key, direction });
    }, []);

    const handlePageChange = useCallback((page) => {
        setPaginacao(prev => ({ ...prev, page }));
    }, []);

    const handlePageSizeChange = useCallback((size) => {
        setPaginacao(prev => ({ ...prev, size, page: 0 }));
    }, []);

    const handleExportarCSV = useCallback(async () => {
        try {
            await dashboardService.exportarCSV({
                ...filtrosDebounce,
                sortBy: sortConfig.key,
                sortDirection: sortConfig.direction
            });
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            alert('Erro ao exportar CSV. Tente novamente.');
        }
    }, [filtrosDebounce, sortConfig]);

    // Queries para carregar dados dos filtros do backend
    const { data: usuarios = [] } = useQuery({
        queryKey: ['usuariosFiltro'],
        queryFn: () => dashboardService.listarUsuarios(),
        staleTime: 1000 * 60 * 5 // 5 minutos
    });

    const { data: prestadores = [] } = useQuery({
        queryKey: ['prestadoresFiltro'],
        queryFn: () => dashboardService.listarPrestadores(),
        staleTime: 1000 * 60 * 5 // 5 minutos
    });

    const { data: empresas = [] } = useQuery({
        queryKey: ['empresasFiltro'],
        queryFn: () => dashboardService.listarEmpresas(),
        staleTime: 1000 * 60 * 5 // 5 minutos
    });

    const { data: tiposPagamento = [] } = useQuery({
        queryKey: ['tiposPagamentoFiltro'],
        queryFn: () => dashboardService.listarTiposPagamento(),
        staleTime: 1000 * 60 * 60 // 1 hora (enum não muda)
    });

    return (
        <div className={styles.container}>
            {/* Header com título e botão exportar */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <FileText size={24} />
                    <h2>Tabela de Orçamentos</h2>
                </div>
                <button 
                    className={styles.btnExportar}
                    onClick={handleExportarCSV}
                    disabled={isLoading}
                >
                    <Download size={18} />
                    Exportar CSV
                </button>
            </div>

            {/* Filtros Avançados */}
            <OrcamentosFiltros
                filtros={filtros}
                onFiltroChange={handleFiltroChange}
                onLimparFiltros={handleLimparFiltros}
                usuarios={usuarios}
                prestadores={prestadores}
                empresas={empresas}
                tiposPagamento={tiposPagamento}
            />

            {/* Tabela com Paginação */}
            <OrcamentosTable
                data={data?.content || []}
                loading={isLoading}
                sortConfig={sortConfig}
                onSort={handleSort}
                pagination={{
                    page: data?.page || 0,
                    size: data?.size || 10,
                    totalElements: data?.totalElements || 0,
                    totalPages: data?.totalPages || 0
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
            />
        </div>
    );
}

export default TabelaOrcamentosProfissional;
