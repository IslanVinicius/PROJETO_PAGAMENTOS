import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, CheckCircle, XCircle, X } from 'lucide-react';
import styles from './AprovacaoCadastro-novo.module.css';
import { solicitacaoAprovacaoService } from '../../services/solicitacaoAprovacaoService';
import { orcamentoService } from '../../services/orcamentoService';
import { empresaService } from '../../services/empresaService';
import { prestadorService } from '../../services/prestadorService';

function AprovacaoCadastro() {
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
    const [orcamentoDetalhes, setOrcamentoDetalhes] = useState(null);
    const [empresaDetalhes, setEmpresaDetalhes] = useState(null);
    const [prestadorDetalhes, setPrestadorDetalhes] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        carregarSolicitacoesPendentes();
    }, []);

    const carregarSolicitacoesPendentes = async () => {
        setLoading(true);
        try {
            const data = await solicitacaoAprovacaoService.listar();
            // Filtra apenas solicitações pendentes
            const pendentes = data.filter(s =>
                (s.statusSolicitacao || 'PENDENTE').toUpperCase() === 'PENDENTE'
            );

            const solicitacoesFormatadas = pendentes.map(item => ({
                id: item.solicitacaoAprovacaold || item.solicitacaoAprovacaoId,
                movimento: item.movimento,
                orcamentoId: item.orcamentold || item.orcamentoId,
                status: item.statusSolicitacao || 'PENDENTE'
            }));

            setSolicitacoes(solicitacoesFormatadas);
            setSearchResults(solicitacoesFormatadas);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao carregar solicitações' });
        } finally {
            setLoading(false);
        }
    };

    const carregarDetalhesCompletos = async (solicitacao) => {
        setLoading(true);
        try {
            // Carrega detalhes do orçamento
            const orcamento = await orcamentoService.obter(solicitacao.orcamentoId);
            setOrcamentoDetalhes(orcamento);

            // Carrega detalhes da empresa
            if (orcamento.empresaID) {
                const empresa = await empresaService.obter(orcamento.empresaID);
                setEmpresaDetalhes(empresa);
            }

            // Carrega detalhes do prestador
            if (orcamento.idPrestador) {
                const prestador = await prestadorService.obter(orcamento.idPrestador);
                setPrestadorDetalhes(prestador);
            }

            setSolicitacaoSelecionada(solicitacao);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao carregar detalhes' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setSearchResults(solicitacoes);
            return;
        }

        const results = solicitacoes.filter(s =>
            s.id.toString().includes(searchTerm) ||
            s.orcamentoId.toString().includes(searchTerm) ||
            s.movimento.includes(searchTerm)
        );
        setSearchResults(results);
    };

    const handleSelectSolicitacao = (solicitacao) => {
        carregarDetalhesCompletos(solicitacao);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleAprovar = async () => {
        if (!solicitacaoSelecionada) return;

        setLoading(true);
        try {
            const dados = {
                movimento: solicitacaoSelecionada.movimento,
                orcamentoId: solicitacaoSelecionada.orcamentoId,
                statusSolicitacao: 'APROVADO'
            };

            await solicitacaoAprovacaoService.atualizar(solicitacaoSelecionada.id, dados);

            setMessage({ type: 'success', text: '✅ Solicitação aprovada com sucesso!' });

            // Recarrega a lista e limpa a seleção
            await carregarSolicitacoesPendentes();
            limparSelecao();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao aprovar solicitação' });
        } finally {
            setLoading(false);
        }
    };

    const handleRejeitar = async () => {
        if (!solicitacaoSelecionada) return;

        setLoading(true);
        try {
            const dados = {
                movimento: solicitacaoSelecionada.movimento,
                orcamentoId: solicitacaoSelecionada.orcamentoId,
                statusSolicitacao: 'REJEITADO'
            };

            await solicitacaoAprovacaoService.atualizar(solicitacaoSelecionada.id, dados);

            setMessage({ type: 'success', text: '❌ Solicitação rejeitada!' });

            await carregarSolicitacoesPendentes();
            limparSelecao();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao rejeitar solicitação' });
        } finally {
            setLoading(false);
        }
    };

    const limparSelecao = () => {
        setSolicitacaoSelecionada(null);
        setOrcamentoDetalhes(null);
        setEmpresaDetalhes(null);
        setPrestadorDetalhes(null);
    };

    const formatarValor = (valor) => {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return 'R$ 0,00';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatarData = (data) => {
        if (!data) return '';
        return data;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>✅</span>
                    <h2>Aprovação de Solicitações</h2>
                </div>
            </div>

            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.content}>
                {/* Lista de solicitações pendentes */}
                <div className={styles.solicitacoesList}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Pesquisar por ID, orçamento ou data..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className={styles.searchButton} onClick={handleSearch}>
                            🔍 Buscar
                        </button>
                    </div>

                    <div className={styles.listHeader}>
                        <span>ID</span>
                        <span>Orçamento</span>
                        <span>Data</span>
                        <span></span>
                    </div>

                    <div className={styles.listItems}>
                        {loading && <p className={styles.loadingText}>Carregando...</p>}

                        {!loading && (searchResults.length > 0 ? searchResults : solicitacoes).map(sol => (
                            <div
                                key={sol.id}
                                className={`${styles.listItem} ${solicitacaoSelecionada?.id === sol.id ? styles.selected : ''}`}
                                onClick={() => handleSelectSolicitacao(sol)}
                            >
                                <span>#{sol.id}</span>
                                <span>#{sol.orcamentoId}</span>
                                <span>{formatarData(sol.movimento)}</span>
                                <span className={styles.statusBadge}>Pendente</span>
                            </div>
                        ))}

                        {!loading && solicitacoes.length === 0 && (
                            <p className={styles.emptyText}>Nenhuma solicitação pendente</p>
                        )}
                    </div>
                </div>

                {/* Detalhes da solicitação selecionada ou estado vazio */}
                {solicitacaoSelecionada && orcamentoDetalhes ? (
                    <div className={styles.detalhesCard}>
                        <h3 className={styles.detalhesTitle}>Detalhes da Solicitação #{solicitacaoSelecionada.id}</h3>

                        <div className={styles.detalhesGrid}>
                            {/* Seção do Orçamento */}
                            <div className={styles.secao}>
                                <h4>📋 Dados do Orçamento</h4>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>ID Orçamento:</span>
                                    <span className={styles.value}>#{orcamentoDetalhes.orcamentoID}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Movimento:</span>
                                    <span className={styles.value}>{orcamentoDetalhes.movimento}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Descrição:</span>
                                    <span className={styles.value}>{orcamentoDetalhes.descricao}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Valor:</span>
                                    <span className={`${styles.value} ${styles.valor}`}>
                                        {formatarValor(orcamentoDetalhes.valor)}
                                    </span>
                                </div>
                            </div>

                            {/* Seção da Empresa */}
                            {empresaDetalhes && (
                                <div className={styles.secao}>
                                    <h4>🏢 Dados da Empresa</h4>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>ID:</span>
                                        <span className={styles.value}>#{empresaDetalhes.idEmpresa}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Nome:</span>
                                        <span className={styles.value}>{empresaDetalhes.nome}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>CNPJ:</span>
                                        <span className={styles.value}>{empresaDetalhes.cnpj}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Razão Social:</span>
                                        <span className={styles.value}>{empresaDetalhes.razao}</span>
                                    </div>
                                </div>
                            )}

                            {/* Seção do Prestador */}
                            {prestadorDetalhes && (
                                <div className={styles.secao}>
                                    <h4>👤 Dados do Prestador</h4>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>ID:</span>
                                        <span className={styles.value}>#{prestadorDetalhes.cod_prestador}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Nome:</span>
                                        <span className={styles.value}>{prestadorDetalhes.nome}</span>
                                    </div>
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>CPF:</span>
                                        <span className={styles.value}>{prestadorDetalhes.cpf}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botões de ação */}
                        <div className={styles.actionButtons}>
                            <button
                                className={`${styles.btn} ${styles.btnApprove}`}
                                onClick={handleAprovar}
                                disabled={loading}
                            >
                                <span>✅</span> Aprovar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnReject}`}
                                onClick={handleRejeitar}
                                disabled={loading}
                            >
                                <span>❌</span> Rejeitar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={limparSelecao}
                                disabled={loading}
                            >
                                <span>🔄</span> Limpar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon}>📋</div>
                        <div className={styles.emptyStateText}>Nenhuma solicitação selecionada</div>
                        <div className={styles.emptyStateHint}>
                            Clique em uma solicitação da lista ao lado para visualizar os detalhes
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AprovacaoCadastro;