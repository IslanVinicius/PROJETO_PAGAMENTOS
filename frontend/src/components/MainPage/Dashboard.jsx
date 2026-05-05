import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText } from 'lucide-react';
import styles from './Dashboard.module.css';
import { dashboardService } from '../../services/dashboardService';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

function Dashboard() {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useMensagemTemporaria(3000);
    
    // Filtros GLOBAIS (topo) - APENAS datas
    const [filtrosGlobais, setFiltrosGlobais] = useState({
        dataInicio: '',
        dataFim: ''
    });

    // Carregar dados ao montar componente
    useEffect(() => {
        carregarDashboard();
    }, []);

    const carregarDashboard = async () => {
        setLoading(true);
        try {
            // Combina filtros globais (datas) para todos os gráficos
            const data = await dashboardService.obterDados(filtrosGlobais);
            setDados(data);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar dashboard' });
        } finally {
            setLoading(false);
        }
    };

    const handleAplicarFiltros = () => {
        carregarDashboard();
    };

    const handleLimparFiltros = () => {
        setFiltrosGlobais({
            dataInicio: '',
            dataFim: ''
        });
        setTimeout(carregarDashboard, 100);
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    if (loading && !dados) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Carregando dashboard...</p>
            </div>
        );
    }

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
                        disabled={loading}
                    >
                        {loading ? 'Filtrando...' : 'Aplicar Filtros'}
                    </button>
                    <button 
                        className={styles.btnLimpar}
                        onClick={handleLimparFiltros}
                        disabled={loading}
                    >
                        Limpar
                    </button>
                </div>
            </div>

            {/* Loading ao filtrar */}
            {loading && dados && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                </div>
            )}

            {/* KPIs Cards */}
            {dados && (
                <>
                    <div className={styles.kpiGrid}>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon}>
                                <FileText size={24} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiLabel}>Total de Orçamentos</span>
                                <span className={styles.kpiValue}>{dados.totalOrcamentos || 0}</span>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon}>
                                <DollarSign size={24} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiLabel}>Valor Total</span>
                                <span className={styles.kpiValue}>{formatarMoeda(dados.valorTotal)}</span>
                            </div>
                        </div>

                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon}>
                                <TrendingUp size={24} />
                            </div>
                            <div className={styles.kpiContent}>
                                <span className={styles.kpiLabel}>Ticket Médio</span>
                                <span className={styles.kpiValue}>{formatarMoeda(dados.ticketMedio)}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Sem dados */}
            {!loading && dados && dados.totalOrcamentos === 0 && (
                <div className={styles.emptyState}>
                    <BarChart3 size={64} />
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>Tente ajustar os filtros ou cadastre novos orçamentos</p>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
