import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, Building2, User, DollarSign, Percent, Calendar, Image as ImageIcon } from 'lucide-react';
import styles from './AprovacaoCadastro.module.css';
import { solicitacaoAprovacaoService } from '../../services/solicitacaoAprovacaoService';
import { orcamentoService } from '../../services/orcamentoService';
import { empresaService } from '../../services/empresaService';
import { prestadorService } from '../../services/prestadorService';
import ConfirmModal from '../Shared/ConfirmModal';

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
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [imagemPreview, setImagemPreview] = useState(null);
    const [abaAtiva, setAbaAtiva] = useState('lista'); // 'lista', 'detalhes'

    useEffect(() => {
        carregarSolicitacoesPendentes();
    }, []);

    const carregarSolicitacoesPendentes = async () => {
        setLoading(true);
        try {
            const data = await solicitacaoAprovacaoService.listar();
            
            if (!data || !Array.isArray(data)) {
                setMessage({ type: 'error', text: 'Dados inválidos recebidos do servidor!' });
                setSolicitacoes([]);
                setSearchResults([]);
                return;
            }
            
            // Filtra apenas solicitações pendentes
            const pendentes = data.filter(s =>
                (s.statusSolicitacao || 'PENDENTE').toUpperCase() === 'PENDENTE'
            );

            const solicitacoesFormatadas = pendentes.map(item => ({
                id: item.solicitacaoAprovacaold || item.solicitacaoAprovacaoId || 0,
                movimento: formatarDataExibicao(item.movimento),
                movimentoRaw: item.movimento || '',
                orcamentoId: item.orcamentold || item.orcamentoId || 0,
                status: item.statusSolicitacao || 'PENDENTE'
            }));

            setSolicitacoes(solicitacoesFormatadas);
            setSearchResults(solicitacoesFormatadas);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar solicitações' });
            setSolicitacoes([]);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const carregarDetalhesCompletos = async (solicitacao) => {
        if (!solicitacao?.orcamentoId) {
            setMessage({ type: 'error', text: 'Solicitação inválida!' });
            return;
        }
        
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
            setAbaAtiva('detalhes'); // Muda para aba de detalhes automaticamente
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao carregar detalhes' });
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
            (s.id || '').toString().includes(searchTerm) ||
            (s.orcamentoId || '').toString().includes(searchTerm) ||
            (s.movimento || '').includes(searchTerm)
        );
        setSearchResults(results);
    };

    const handleSelectSolicitacao = (solicitacao) => {
        if (!solicitacao) return;
        carregarDetalhesCompletos(solicitacao);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleAprovarClick = () => {
        if (!solicitacaoSelecionada?.id) {
            setMessage({ type: 'error', text: 'Selecione uma solicitação primeiro!' });
            return;
        }
        setShowApproveModal(true);
    };

    const handleAprovarConfirm = async () => {
        setShowApproveModal(false);
        setLoading(true);
        try {
            // Usa a data raw (original) para enviar ao backend
            const dados = {
                movimento: solicitacaoSelecionada?.movimentoRaw || '',
                orcamentoId: solicitacaoSelecionada?.orcamentoId || 0,
                statusSolicitacao: 'APROVADO'
            };

            await solicitacaoAprovacaoService.atualizar(solicitacaoSelecionada?.id || 0, dados);

            setMessage({ type: 'success', text: '✅ Solicitação aprovada com sucesso!' });

            // Recarrega a lista e limpa a seleção
            await carregarSolicitacoesPendentes();
            limparSelecao();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao aprovar solicitação' });
        } finally {
            setLoading(false);
        }
    };

    const handleRejeitarClick = () => {
        if (!solicitacaoSelecionada?.id) {
            setMessage({ type: 'error', text: 'Selecione uma solicitação primeiro!' });
            return;
        }
        setShowRejectModal(true);
    };

    const handleRejeitarConfirm = async () => {
        setShowRejectModal(false);
        setLoading(true);
        try {
            // Usa a data raw (original) para enviar ao backend
            const dados = {
                movimento: solicitacaoSelecionada?.movimentoRaw || '',
                orcamentoId: solicitacaoSelecionada?.orcamentoId || 0,
                statusSolicitacao: 'REJEITADO'
            };

            await solicitacaoAprovacaoService.atualizar(solicitacaoSelecionada?.id || 0, dados);

            setMessage({ type: 'success', text: '❌ Solicitação rejeitada!' });

            await carregarSolicitacoesPendentes();
            limparSelecao();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao rejeitar solicitação' });
        } finally {
            setLoading(false);
        }
    };

    const limparSelecao = () => {
        setSolicitacaoSelecionada(null);
        setOrcamentoDetalhes(null);
        setEmpresaDetalhes(null);
        setPrestadorDetalhes(null);
        setAbaAtiva('lista'); // Volta para aba de lista
    };

    const formatarDataExibicao = (data) => {
        // Tratamento robusto para diferentes formatos de data
        if (!data || data === 'null' || data === 'undefined' || data === null || data === undefined) {
            return '';
        }
        
        // Converte para string e remove espaços em branco
        const dataStr = String(data).trim();
        
        // Validação básica
        if (!dataStr || dataStr.length < 8) {
            return '';
        }
        
        // Se já estiver no formato DD/MM/YYYY, retorna como está
        if (dataStr.includes('/')) {
            const partes = dataStr.split('/');
            // Valida se tem 3 partes (dia, mes, ano)
            if (partes.length === 3 && partes[0] && partes[1] && partes[2] && partes[2].length === 4) {
                return dataStr;
            }
            return '';
        }
        
        // Se estiver no formato YYYY-MM-DD, converte para DD/MM/YYYY
        const partes = dataStr.split('-');
        if (partes.length === 3) {
            const [ano, mes, dia] = partes;
            // Valida se todas as partes existem e são válidas
            if (ano && mes && dia && ano.length === 4 && mes.length === 2 && dia.length === 2) {
                return `${dia}/${mes}/${ano}`;
            }
        }
        
        // Retorna vazio se não conseguir formatar
        return '';
    };

    const formatarValor = (valor) => {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return 'R$ 0,00';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
                {/* Abas de Navegação */}
                {solicitacaoSelecionada && (
                    <div className={styles.tabsContainer}>
                        <button
                            className={`${styles.tabButton} ${abaAtiva === 'lista' ? styles.active : ''}`}
                            onClick={() => setAbaAtiva('lista')}
                        >
                            <FileText size={18} />
                            Lista de Solicitações
                        </button>
                        <button
                            className={`${styles.tabButton} ${abaAtiva === 'detalhes' ? styles.active : ''}`}
                            onClick={() => setAbaAtiva('detalhes')}
                            disabled={!orcamentoDetalhes}
                        >
                            <Building2 size={18} />
                            Detalhes do Orçamento #{orcamentoDetalhes?.orcamentoID || solicitacaoSelecionada.orcamentoId}
                        </button>
                    </div>
                )}

                {/* Conteúdo das Abas */}
                <div className={styles.tabContent}>
                    {/* ABA 1: Lista de Solicitações */}
                    {abaAtiva === 'lista' && (
                        <div className={styles.solicitacoesPanel}>
                            <div className={styles.searchBox}>
                                <div className={styles.searchContainer}>
                                    <input
                                        type="text"
                                        className={styles.searchInput}
                                        placeholder="Pesquisar por ID, orçamento ou data..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button className={styles.searchButton} onClick={handleSearch}>
                                        <FileText size={16} /> Buscar
                                    </button>
                                </div>
                            </div>

                            <div className={styles.listHeader}>
                                <span>ID</span>
                                <span>Orçamento</span>
                                <span>Data</span>
                                <span>Status</span>
                            </div>

                            <div className={styles.listItems}>
                                {loading && <p className={styles.loadingText}>Carregando...</p>}

                                {!loading && (searchResults.length > 0 ? searchResults : solicitacoes).map((sol, index) => (
                                    <div
                                        key={`${sol.id}-${index}`}
                                        className={`${styles.listItem} ${solicitacaoSelecionada?.id === sol.id ? styles.selected : ''}`}
                                        onClick={() => handleSelectSolicitacao(sol)}
                                    >
                                        <span>#{sol.id || 'N/A'}</span>
                                        <span>#{sol.orcamentoId || 'N/A'}</span>
                                        <span>{sol.movimento || 'N/A'}</span>
                                        <span className={styles.statusBadge}>Pendente</span>
                                    </div>
                                ))}

                                {!loading && solicitacoes.length === 0 && (
                                    <p className={styles.emptyText}>Nenhuma solicitação pendente</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA 2: Detalhes da solicitação selecionada */}
                    {abaAtiva === 'detalhes' && solicitacaoSelecionada && orcamentoDetalhes ? (
                        <div className={styles.detalhesPanel}>
                            {/* Tabela de Dados do Orçamento */}
                            <div className={styles.infoCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>
                                        <FileText size={20} />
                                    </div>
                                    <h3 className={styles.cardTitle}>Orçamento #{orcamentoDetalhes.orcamentoID}</h3>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <tbody>
                                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)', width: '200px' }}>Data do Movimento</td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <Calendar size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                                {orcamentoDetalhes.movimento ? formatarDataExibicao(orcamentoDetalhes.movimento) : 'N/A'}
                                            </td>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>Descrição</td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>{orcamentoDetalhes.descricao || 'N/A'}</td>
                                        </tr>
                                        {orcamentoDetalhes.tipoPagamento && (
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>Tipo de Pagamento</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{orcamentoDetalhes.tipoPagamento}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Tabela de Itens do Orçamento */}
                            {orcamentoDetalhes.itens && orcamentoDetalhes.itens.length > 0 && (
                                <div className={styles.infoCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <FileText size={20} />
                                        </div>
                                        <h3 className={styles.cardTitle}>Itens do Orçamento ({orcamentoDetalhes.itens.length})</h3>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', backgroundColor: 'var(--bg-tertiary)' }}>
                                                    <th style={{ padding: 'var(--spacing-md)' }}>Item</th>
                                                    <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
                                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Qtd.</th>
                                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Valor Unit.</th>
                                                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orcamentoDetalhes.itens.map((item, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                        <td style={{ padding: 'var(--spacing-md)' }}>#{item.itemId || item.id || index + 1}</td>
                                                        <td style={{ padding: 'var(--spacing-md)' }}>{item.itemNome || item.descricao || item.nome || item.produto || 'N/A'}</td>
                                                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>{item.quantidade || item.qtd || 1}</td>
                                                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
                                                            {formatarValor(item.valorUnitario || item.valorUnit || item.preco || 0)}
                                                        </td>
                                                        <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: '700', color: 'var(--success-color)' }}>
                                                            {formatarValor(item.valorTotal || item.total || 0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Tabela de Resumo Financeiro */}
                            <div className={styles.resumoFinanceiro}>
                                <div className={styles.resumoTitulo}>Resumo Financeiro</div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--success-color)', textAlign: 'left' }}>
                                                <th style={{ padding: 'var(--spacing-md)' }}>Descrição</th>
                                                <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Valor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)' }}>
                                                    <DollarSign size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                                    Valor Total dos Itens
                                                </td>
                                                <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: '600' }}>
                                                    {formatarValor(orcamentoDetalhes.valorTotalItens || orcamentoDetalhes.valor || 0)}
                                                </td>
                                            </tr>
                                            {orcamentoDetalhes.desconto && (
                                                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                    <td style={{ padding: 'var(--spacing-md)' }}>
                                                        <Percent size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                                                        Desconto
                                                    </td>
                                                    <td style={{ padding: 'var(--spacing-md)', textAlign: 'right', fontWeight: '600', color: 'var(--danger-color)' }}>
                                                        - {formatarValor(orcamentoDetalhes.desconto)}
                                                    </td>
                                                </tr>
                                            )}
                                            <tr style={{ borderBottom: '3px solid var(--success-color)', backgroundColor: 'rgba(52, 168, 83, 0.05)' }}>
                                                <td style={{ padding: 'var(--spacing-lg)', fontWeight: '700', fontSize: '16px' }}>
                                                    VALOR FINAL
                                                </td>
                                                <td style={{ padding: 'var(--spacing-lg)', textAlign: 'right' }}>
                                                    <span className={`${styles.resumoValor} ${styles.total}`}>
                                                        {formatarValor(orcamentoDetalhes.valorFinal || orcamentoDetalhes.valor || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tabela de Dados da Empresa */}
                            {empresaDetalhes && (
                                <div className={styles.infoCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <Building2 size={20} />
                                        </div>
                                        <h3 className={styles.cardTitle}>Dados da Empresa</h3>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)', width: '200px' }}>ID</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>#{empresaDetalhes.idEmpresa || 'N/A'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>Nome Fantasia</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{empresaDetalhes.nome || 'N/A'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>Razão Social</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{empresaDetalhes.razao || 'N/A'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>CNPJ</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{empresaDetalhes.cnpj || 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Tabela de Dados do Prestador */}
                            {prestadorDetalhes && (
                                <div className={styles.infoCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <User size={20} />
                                        </div>
                                        <h3 className={styles.cardTitle}>Dados do Prestador</h3>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)', width: '200px' }}>ID</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>#{prestadorDetalhes.cod_prestador || 'N/A'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>Nome</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{prestadorDetalhes.nome || 'N/A'}</td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                                                <td style={{ padding: 'var(--spacing-md)', fontWeight: '700', color: 'var(--text-secondary)' }}>CPF</td>
                                                <td style={{ padding: 'var(--spacing-md)' }}>{prestadorDetalhes.cpf || 'N/A'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Galeria de Imagens */}
                            {orcamentoDetalhes.imagens && orcamentoDetalhes.imagens.length > 0 && (
                                <div className={styles.infoCard}>
                                    <div className={styles.cardHeader}>
                                        <div className={styles.cardIcon}>
                                            <ImageIcon size={20} />
                                        </div>
                                        <h3 className={styles.cardTitle}>Imagens Anexadas ({orcamentoDetalhes.imagens.length})</h3>
                                    </div>
                                    <div className={styles.imagensGrid}>
                                        {orcamentoDetalhes.imagens.map((img, index) => (
                                            <div
                                                key={img.idImagem || index}
                                                className={styles.imagemCard}
                                                onClick={() => img.urlImagem && setImagemPreview(img.urlImagem)}
                                            >
                                                {img.urlImagem ? (
                                                    <img src={img.urlImagem} alt={`Imagem ${index + 1}`} className={styles.imagemPreview} />
                                                ) : (
                                                    <div className={styles.imagemPlaceholder}>📷</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Botões de Ação */}
                            <div className={styles.actionButtons}>
                                <button
                                    className={`${styles.btn} ${styles.btnApprove}`}
                                    onClick={handleAprovarClick}
                                    disabled={loading}
                                >
                                    <CheckCircle size={18} /> Aprovar
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnReject}`}
                                    onClick={handleRejeitarClick}
                                    disabled={loading}
                                >
                                    <XCircle size={18} /> Rejeitar
                                </button>
                                <button
                                    className={`${styles.btn} ${styles.btnCancel}`}
                                    onClick={limparSelecao}
                                    disabled={loading}
                                >
                                    <FileText size={18} /> Voltar para Lista
                                </button>
                            </div>
                        </div>
                    ) : abaAtiva === 'detalhes' ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>⏳</div>
                            <div className={styles.emptyStateText}>Carregando detalhes...</div>
                            <div className={styles.emptyStateHint}>
                                Aguarde enquanto buscamos as informações do orçamento
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyStateIcon}>👈</div>
                            <div className={styles.emptyStateText}>Nenhuma solicitação selecionada</div>
                            <div className={styles.emptyStateHint}>
                                Selecione uma solicitação na lista para visualizar os detalhes
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleAprovarConfirm}
                title="Confirmar Aprovação"
                message="Tem certeza que deseja aprovar esta solicitação?"
                itemName={`Solicitação #${solicitacaoSelecionada?.id}`}
                confirmText="Sim, Aprovar"
                cancelText="Cancelar"
                variant="success"
            />

            <ConfirmModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleRejeitarConfirm}
                title="Confirmar Rejeição"
                message="Tem certeza que deseja rejeitar esta solicitação?"
                itemName={`Solicitação #${solicitacaoSelecionada?.id}`}
                confirmText="Sim, Rejeitar"
                cancelText="Cancelar"
            />

            {/* Modal de Preview de Imagem */}
            {imagemPreview && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={() => setImagemPreview(null)}
                >
                    <img 
                        src={imagemPreview} 
                        alt="Preview" 
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default AprovacaoCadastro;
