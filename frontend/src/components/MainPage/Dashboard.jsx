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

    // Filtros LOCAIS por gráfico
    const [filtroEmpresa, setFiltroEmpresa] = useState({
        prestadorIds: [],
        tiposPagamento: []
    });
    
    const [filtroPrestador, setFiltroPrestador] = useState({
        empresaIds: [],
        tiposPagamento: []
    });
    
    const [filtroPeriodo, setFiltroPeriodo] = useState({
        empresaIds: [],
        prestadorIds: []
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

                    {/* Gráficos */}
                    <div className={styles.chartsGrid}>
                        {/* Orçamentos por Empresa - Filtro local: Prestador, Tipo Pagamento */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Orçamentos por Empresa</h3>
                                <div className={styles.chartFilters}>
                                    <select 
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroEmpresa({
                                                    ...filtroEmpresa,
                                                    prestadorIds: [...filtroEmpresa.prestadorIds, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Prestador</option>
                                        {dados?.prestadoresDisponiveis?.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroEmpresa({
                                                    ...filtroEmpresa,
                                                    tiposPagamento: [...filtroEmpresa.tiposPagamento, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Tipo</option>
                                        {dados?.tiposPagamentoDisponiveis?.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    
                                    {(filtroEmpresa.prestadorIds.length > 0 || filtroEmpresa.tiposPagamento.length > 0) && (
                                        <button 
                                            onClick={() => setFiltroEmpresa({ prestadorIds: [], tiposPagamento: [] })}
                                            className={styles.clearFilterBtn}
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                            {dados.orcamentosPorEmpresa && dados.orcamentosPorEmpresa.length > 0 ? (
                                <div className={styles.barChart}>
                                    {dados.orcamentosPorEmpresa.map((item, index) => (
                                        <div key={index} className={styles.barItem}>
                                            <div className={styles.barLabel}>{item.nome}</div>
                                            <div className={styles.barContainer}>
                                                <div 
                                                    className={styles.bar}
                                                    style={{ 
                                                        width: `${Math.min((item.quantidade / Math.max(...dados.orcamentosPorEmpresa.map(i => i.quantidade))) * 100, 100)}%` 
                                                    }}
                                                >
                                                    <span className={styles.barValue}>{item.quantidade} orçamentos</span>
                                                </div>
                                            </div>
                                            <div className={styles.barAmount}>{formatarMoeda(item.valorTotal)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noData}>Nenhum dado disponível</p>
                            )}
                        </div>

                        {/* Orçamentos por Prestador - Filtro local: Empresa, Tipo Pagamento */}
                        <div className={styles.chartCard}>
                            <div className={styles.chartHeader}>
                                <h3>Orçamentos por Prestador</h3>
                                <div className={styles.chartFilters}>
                                    <select 
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroPrestador({
                                                    ...filtroPrestador,
                                                    empresaIds: [...filtroPrestador.empresaIds, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Empresa</option>
                                        {dados?.empresasDisponiveis?.map(e => (
                                            <option key={e.id} value={e.id}>{e.nome}</option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroPrestador({
                                                    ...filtroPrestador,
                                                    tiposPagamento: [...filtroPrestador.tiposPagamento, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Tipo</option>
                                        {dados?.tiposPagamentoDisponiveis?.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    
                                    {(filtroPrestador.empresaIds.length > 0 || filtroPrestador.tiposPagamento.length > 0) && (
                                        <button 
                                            onClick={() => setFiltroPrestador({ empresaIds: [], tiposPagamento: [] })}
                                            className={styles.clearFilterBtn}
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                            {dados.orcamentosPorPrestador && dados.orcamentosPorPrestador.length > 0 ? (
                                <div className={styles.barChart}>
                                    {dados.orcamentosPorPrestador.map((item, index) => (
                                        <div key={index} className={styles.barItem}>
                                            <div className={styles.barLabel}>{item.nome}</div>
                                            <div className={styles.barContainer}>
                                                <div 
                                                    className={styles.bar}
                                                    style={{ 
                                                        width: `${Math.min((item.quantidade / Math.max(...dados.orcamentosPorPrestador.map(i => i.quantidade))) * 100, 100)}%` 
                                                    }}
                                                >
                                                    <span className={styles.barValue}>{item.quantidade} orçamentos</span>
                                                </div>
                                            </div>
                                            <div className={styles.barAmount}>{formatarMoeda(item.valorTotal)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noData}>Nenhum dado disponível</p>
                            )}
                        </div>

                        {/* Orçamentos por Período - Filtro local: Empresa, Prestador */}
                        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                            <div className={styles.chartHeader}>
                                <h3>Orçamentos por Período</h3>
                                <div className={styles.chartFilters}>
                                    <select 
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroPeriodo({
                                                    ...filtroPeriodo,
                                                    empresaIds: [...filtroPeriodo.empresaIds, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Empresa</option>
                                        {dados?.empresasDisponiveis?.map(e => (
                                            <option key={e.id} value={e.id}>{e.nome}</option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        value=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                setFiltroPeriodo({
                                                    ...filtroPeriodo,
                                                    prestadorIds: [...filtroPeriodo.prestadorIds, e.target.value]
                                                });
                                            }
                                        }}
                                        className={styles.filterSelect}
                                    >
                                        <option value="">Filtrar por Prestador</option>
                                        {dados?.prestadoresDisponiveis?.map(p => (
                                            <option key={p.id} value={p.id}>{p.nome}</option>
                                        ))}
                                    </select>
                                    
                                    {(filtroPeriodo.empresaIds.length > 0 || filtroPeriodo.prestadorIds.length > 0) && (
                                        <button 
                                            onClick={() => setFiltroPeriodo({ empresaIds: [], prestadorIds: [] })}
                                            className={styles.clearFilterBtn}
                                        >
                                            Limpar
                                        </button>
                                    )}
                                </div>
                            </div>
                            {dados.orcamentosPorPeriodo && dados.orcamentosPorPeriodo.length > 0 ? (
                                <div className={styles.periodChart}>
                                    <div className={styles.periodLabels}>
                                        {dados.orcamentosPorPeriodo.map((item, index) => (
                                            <div key={index} className={styles.periodColumn}>
                                                <div className={styles.periodMonth}>{item.periodo}</div>
                                                <div 
                                                    className={styles.periodBar}
                                                    style={{ 
                                                        height: `${Math.min((item.valorTotal / Math.max(...dados.orcamentosPorPeriodo.map(i => i.valorTotal))) * 200, 200)}px` 
                                                    }}
                                                >
                                                    <span className={styles.periodValue}>{formatarMoeda(item.valorTotal)}</span>
                                                </div>
                                                <div className={styles.periodCount}>{item.quantidade} orç.</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.noData}>Nenhum dado disponível</p>
                            )}
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
