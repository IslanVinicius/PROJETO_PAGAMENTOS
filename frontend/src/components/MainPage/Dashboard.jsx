import React, { useState, useCallback } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import styles from './Dashboard.module.css';
import { dashboardService } from '../../services/dashboardService';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

// Importar componentes do Dashboard
import KpiCard from './Dashboard/KpiCard';
import GraficoEvolucao from './Dashboard/GraficoEvolucao';
import GraficoPrestadores from './Dashboard/GraficoPrestadores';
import GraficoStatus from './Dashboard/GraficoStatus';
import TabelaOrcamentosProfissional from './Dashboard/TabelaOrcamentosProfissional';

function Dashboard() {
    const [message, setMessage] = useMensagemTemporaria(3000);
    
    // Filtros GLOBAIS (topo) - APENAS datas
    const [filtrosGlobais, setFiltrosGlobais] = useState({
        dataInicio: '',
        dataFim: ''
    });

    // Debounce para filtros - evita múltiplas requisições
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosGlobais);

    // Queries com React Query
    const { data: resumoData, isLoading: loadingResumo } = useQuery({
        queryKey: ['dashboardResumo', filtrosAplicados],
        queryFn: () => dashboardService.obterResumo(filtrosAplicados),
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 2
    });

    const { data: evolucaoData, isLoading: loadingEvolucao } = useQuery({
        queryKey: ['dashboardEvolucao', filtrosAplicados],
        queryFn: () => dashboardService.obterEvolucao(filtrosAplicados),
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    const { data: prestadoresData, isLoading: loadingPrestadores } = useQuery({
        queryKey: ['dashboardPrestadores', filtrosAplicados],
        queryFn: () => dashboardService.obterPrestadores(filtrosAplicados),
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    const { data: statusData, isLoading: loadingStatus } = useQuery({
        queryKey: ['dashboardStatus', filtrosAplicados],
        queryFn: () => dashboardService.obterStatus(filtrosAplicados),
        staleTime: 5 * 60 * 1000,
        retry: 2
    });

    // Handler para aplicar filtros com debounce
    const handleAplicarFiltros = useCallback(() => {
        setFiltrosAplicados(filtrosGlobais);
    }, [filtrosGlobais]);

    // Handler para limpar filtros
    const handleLimparFiltros = useCallback(() => {
        const filtrosVazios = {
            dataInicio: '',
            dataFim: ''
        };
        setFiltrosGlobais(filtrosVazios);
        setFiltrosAplicados(filtrosVazios);
    }, []);

    // Formatar moeda
    const formatarMoeda = useCallback((valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    }, []);

    return (
        <div className={styles.container}>
            {/* Mensagem temporária */}
            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <BarChart3 size={32} />
                    <h1>Dashboard de Orçamentos</h1>
                </div>
            </div>

            {/* Filtros GLOBAIS - APENAS DATAS */}
            <div className={styles.filtros}>
                <div className={styles.filtroGroup}>
                    <label>Data Inicial</label>
                    <input
                        type="date"
                        value={filtrosGlobais.dataInicio}
                        onChange={(e) => setFiltrosGlobais({...filtrosGlobais, dataInicio: e.target.value})}
                    />
                </div>
                
                <div className={styles.filtroGroup}>
                    <label>Data Final</label>
                    <input
                        type="date"
                        value={filtrosGlobais.dataFim}
                        onChange={(e) => setFiltrosGlobais({...filtrosGlobais, dataFim: e.target.value})}
                    />
                </div>

                <div className={styles.filtroActions}>
                    <button 
                        className={styles.btnFiltrar}
                        onClick={handleAplicarFiltros}
                    >
                        Aplicar Filtros
                    </button>
                    <button 
                        className={styles.btnLimpar}
                        onClick={handleLimparFiltros}
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {/* KPIs Cards */}
            <div className={styles.kpiGrid}>
                <KpiCard
                    title="Total de Orçamentos"
                    value={resumoData?.totalOrcamentos || 0}
                    icon={<FileText size={24} />}
                    color="blue"
                />
                
                <KpiCard
                    title="Valor Total"
                    value={formatarMoeda(resumoData?.valorTotal)}
                    icon={<DollarSign size={24} />}
                    color="green"
                />
                
                <KpiCard
                    title="Ticket Médio"
                    value={formatarMoeda(resumoData?.ticketMedio)}
                    icon={<TrendingUp size={24} />}
                    color="purple"
                />
                
                <KpiCard
                    title="Taxa de Aprovação"
                    value={`${(resumoData?.taxaAprovacao || 0).toFixed(1)}%`}
                    icon={<CheckCircle size={24} />}
                    color="orange"
                />
            </div>

            {/* Gráficos - Primeira Linha */}
            <div className={styles.chartsRow}>
                <div className={styles.chartFull}>
                    <GraficoEvolucao 
                        data={evolucaoData || []} 
                        loading={loadingEvolucao} 
                    />
                </div>
            </div>

            {/* Gráficos - Segunda Linha */}
            <div className={styles.chartsRow}>
                <div className={styles.chartHalf}>
                    <GraficoPrestadores 
                        data={prestadoresData || []} 
                        loading={loadingPrestadores} 
                    />
                </div>
                
                <div className={styles.chartHalf}>
                    <GraficoStatus 
                        data={statusData || []} 
                        loading={loadingStatus} 
                    />
                </div>
            </div>

            {/* Tabela Profissional de Orçamentos */}
            <div className={styles.tableSection}>
                <TabelaOrcamentosProfissional />
            </div>

            {/* Estado vazio quando não há dados */}
            {!loadingResumo && !resumoData && (
                <div className={styles.emptyState}>
                    <BarChart3 size={64} />
                    <h3>Nenhum dado disponível</h3>
                    <p>Tente ajustar os filtros ou cadastre novos orçamentos</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
