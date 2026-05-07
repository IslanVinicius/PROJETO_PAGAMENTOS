import React, { useState, useEffect } from 'react';
import { 
    CheckCircle, XCircle, FileText, Building2, User, DollarSign, 
    Percent, Calendar, Image as ImageIcon, ArrowLeft, Clock,
    TrendingUp, Hash, MessageSquare
} from 'lucide-react';
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
    const [observacaoAprovador, setObservacaoAprovador] = useState('');

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
            const dados = {
                movimento: solicitacaoSelecionada?.movimentoRaw || '',
                orcamentoId: solicitacaoSelecionada?.orcamentoId || 0,
                statusSolicitacao: 'APROVADO'
            };

            await solicitacaoAprovacaoService.atualizar(solicitacaoSelecionada?.id || 0, dados);

            setMessage({ type: 'success', text: '✅ Solicitação aprovada com sucesso!' });

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
        setObservacaoAprovador('');
        setAbaAtiva('lista');
    };

    const formatarDataExibicao = (data) => {
        if (!data || data === 'null' || data === 'undefined' || data === null || data === undefined) {
            return '';
        }
        
        const dataStr = String(data).trim();
        
        if (!dataStr || dataStr.length < 8) {
            return '';
        }
        
        if (dataStr.includes('/')) {
            const partes = dataStr.split('/');
            if (partes.length === 3 && partes[0] && partes[1] && partes[2] && partes[2].length === 4) {
                return dataStr;
            }
            return '';
        }
        
        const partes = dataStr.split('-');
        if (partes.length === 3) {
            const [ano, mes, dia] = partes;
            if (ano && mes && dia && ano.length === 4 && mes.length === 2 && dia.length === 2) {
                return `${dia}/${mes}/${ano}`;
            }
        }
        
        return '';
    };

    const formatarValor = (valor) => {
        const numero = parseFloat(valor);
        if (isNaN(numero)) return 'R$ 0,00';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className={styles.container}>
            {/* Header Principal */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerTitle}>
                        <CheckCircle size={28} />
                        <h2>Aprovação de Orçamentos</h2>
                    </div>
                    <div className={styles.headerSubtitle}>
                        Analise e aprove orçamentos pendentes de forma rápida e segura
                    </div>
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
                            <ArrowLeft size={18} />
                            Lista de Pendências
                        </button>
                        <button
                            className={`${styles.tabButton} ${abaAtiva === 'detalhes' ? styles.active : ''}`}
                            onClick={() => setAbaAtiva('detalhes')}
                            disabled={!orcamentoDetalhes}
                        >
                            <FileText size={18} />
                            Análise #{orcamentoDetalhes?.orcamentoID || solicitacaoSelecionada.orcamentoId}
                        </button>
                    </div>
                )}

                {/* Conteúdo das Abas */}
                <div className={styles.tabContent}>
                    {/* ABA 1: Lista de Solicitações */}
                    {abaAtiva === 'lista' && (
                        <div className={styles.listaPanel}>
                            <div className={styles.searchSection}>
                                <input
                                    type="text"
                                    className={styles.searchInput}
                                    placeholder="🔍 Pesquisar por ID, orçamento ou data..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button className={styles.searchButton} onClick={handleSearch}>
                                    Buscar
                                </button>
                            </div>

                            <div className={styles.listaHeader}>
                                <span>ID</span>
                                <span>Orçamento</span>
                                <span>Data</span>
                                <span>Status</span>
                            </div>

                            <div className={styles.listaBody}>
                                {loading && <p className={styles.loadingText}>Carregando solicitações...</p>}

                                {!loading && (searchResults.length > 0 ? searchResults : solicitacoes).map((sol, index) => (
                                    <div
                                        key={`${sol.id}-${index}`}
                                        className={`${styles.listaItem} ${solicitacaoSelecionada?.id === sol.id ? styles.selected : ''}`}
                                        onClick={() => handleSelectSolicitacao(sol)}
                                    >
                                        <span className={styles.listaItemId}>#{sol.id || 'N/A'}</span>
                                        <span className={styles.listaItemOrcamento}>#{sol.orcamentoId || 'N/A'}</span>
                                        <span className={styles.listaItemData}>{sol.movimento || 'N/A'}</span>
                                        <span className={`${styles.badge} ${styles.badgePendente}`}>Pendente</span>
                                    </div>
                                ))}

                                {!loading && solicitacoes.length === 0 && (
                                    <div className={styles.emptyState}>
                                        <Clock size={48} />
                                        <p>Nenhuma solicitação pendente no momento</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABA 2: Detalhes da Aprovação */}
                    {abaAtiva === 'detalhes' && solicitacaoSelecionada && orcamentoDetalhes ? (
                        <div className={styles.detalhesPanel}>
                            
                            {/* HEADER DO ORÇAMENTO - Informações Principais */}
                            <div className={styles.approvalHeader}>
                                <div className={styles.headerLeft}>
                                    <div className={styles.headerMainInfo}>
                                        <div className={styles.orcamentoId}>
                                            <Hash size={20} />
                                            <span>Orçamento #{orcamentoDetalhes.orcamentoID}</span>
                                        </div>
                                        <div className={styles.statusBadge}>
                                            <Clock size={16} />
                                            <span>PENDENTE DE APROVAÇÃO</span>
                                        </div>
                                    </div>
                                    
                                    <div className={styles.headerMetaInfo}>
                                        <div className={styles.metaItem}>
                                            <Calendar size={16} />
                                            <span>{orcamentoDetalhes.movimento ? formatarDataExibicao(orcamentoDetalhes.movimento) : 'N/A'}</span>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <DollarSign size={16} />
                                            <span className={styles.valorDestaque}>
                                                {formatarValor(orcamentoDetalhes.valorFinal || orcamentoDetalhes.valor || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* GRID PRINCIPAL - 2 Colunas no Desktop */}
                            <div className={styles.approvalGrid}>
                                
                                {/* COLUNA ESQUERDA - Dados Completos */}
                                <div className={styles.leftColumn}>
                                    
                                    {/* Seção: Dados Gerais */}
                                    <section className={styles.infoSection}>
                                        <h3 className={styles.sectionTitle}>
                                            <Building2 size={18} />
                                            Dados Gerais
                                        </h3>
                                        <div className={styles.infoGrid}>
                                            <div className={styles.infoField}>
                                                <label>Empresa</label>
                                                <div className={styles.fieldValue}>
                                                    {empresaDetalhes ? (
                                                        <>
                                                            <strong>{empresaDetalhes.nome || 'N/A'}</strong>
                                                            <small>CNPJ: {empresaDetalhes.cnpj || 'N/A'}</small>
                                                        </>
                                                    ) : 'Carregando...'}
                                                </div>
                                            </div>
                                            
                                            <div className={styles.infoField}>
                                                <label>Prestador</label>
                                                <div className={styles.fieldValue}>
                                                    {prestadorDetalhes ? (
                                                        <>
                                                            <strong>{prestadorDetalhes.nome || 'N/A'}</strong>
                                                            <small>CPF: {prestadorDetalhes.cpf || 'N/A'}</small>
                                                        </>
                                                    ) : 'Carregando...'}
                                                </div>
                                            </div>
                                            
                                            <div className={styles.infoField}>
                                                <label>Tipo de Pagamento</label>
                                                <div className={styles.fieldValue}>
                                                    {orcamentoDetalhes.tipoPagamento || 'N/A'}
                                                </div>
                                            </div>
                                            
                                            <div className={styles.infoField}>
                                                <label>Descrição</label>
                                                <div className={styles.fieldValue}>
                                                    {orcamentoDetalhes.descricao || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Seção: Itens do Orçamento */}
                                    {orcamentoDetalhes.itens && orcamentoDetalhes.itens.length > 0 && (
                                        <section className={styles.infoSection}>
                                            <h3 className={styles.sectionTitle}>
                                                <FileText size={18} />
                                                Itens do Orçamento ({orcamentoDetalhes.itens.length})
                                            </h3>
                                            <div className={styles.tableContainer}>
                                                <table className={styles.modernTable}>
                                                    <thead>
                                                        <tr>
                                                            <th>Item</th>
                                                            <th>Descrição</th>
                                                            <th className={styles.textRight}>Qtd.</th>
                                                            <th className={styles.textRight}>Valor Unit.</th>
                                                            <th className={styles.textRight}>Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orcamentoDetalhes.itens.map((item, index) => (
                                                            <tr key={index} className={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                                                <td>#{item.itemId || item.id || index + 1}</td>
                                                                <td>{item.itemNome || item.descricao || item.nome || item.produto || 'N/A'}</td>
                                                                <td className={styles.textRight}>{item.quantidade || item.qtd || 1}</td>
                                                                <td className={styles.textRight}>
                                                                    {formatarValor(item.valorUnitario || item.valorUnit || item.preco || 0)}
                                                                </td>
                                                                <td className={`${styles.textRight} ${styles.fontBold}`}>
                                                                    {formatarValor(item.valorTotal || item.total || 0)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </section>
                                    )}

                                    {/* Seção: Resumo Financeiro */}
                                    <section className={styles.financeSection}>
                                        <h3 className={styles.sectionTitle}>
                                            <TrendingUp size={18} />
                                            Resumo Financeiro
                                        </h3>
                                        <div className={styles.financeGrid}>
                                            <div className={styles.financeRow}>
                                                <span>Subtotal dos Itens:</span>
                                                <span className={styles.financeValue}>
                                                    {formatarValor(orcamentoDetalhes.valorTotalItens || orcamentoDetalhes.valor || 0)}
                                                </span>
                                            </div>
                                            {orcamentoDetalhes.desconto && (
                                                <div className={styles.financeRow}>
                                                    <span>Desconto:</span>
                                                    <span className={`${styles.financeValue} ${styles.discount}`}>
                                                        - {formatarValor(orcamentoDetalhes.desconto)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`${styles.financeRow} ${styles.financeTotal}`}>
                                                <span>VALOR FINAL:</span>
                                                <span className={styles.totalValue}>
                                                    {formatarValor(orcamentoDetalhes.valorFinal || orcamentoDetalhes.valor || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Seção: Imagens */}
                                    {orcamentoDetalhes.imagens && orcamentoDetalhes.imagens.length > 0 && (
                                        <section className={styles.infoSection}>
                                            <h3 className={styles.sectionTitle}>
                                                <ImageIcon size={18} />
                                                Imagens Anexadas ({orcamentoDetalhes.imagens.length})
                                            </h3>
                                            <div className={styles.imagensGrid}>
                                                {orcamentoDetalhes.imagens.map((img, index) => (
                                                    <div
                                                        key={img.idImagem || index}
                                                        className={styles.imagemCard}
                                                        onClick={() => img.urlImagem && setImagemPreview(img.urlImagem)}
                                                    >
                                                        {img.urlImagem ? (
                                                            <img src={img.urlImagem} alt={`Imagem ${index + 1}`} className={styles.imagemThumb} />
                                                        ) : (
                                                            <div className={styles.imagemPlaceholder}>📷</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* COLUNA DIREITA - Painel de Decisão */}
                                <div className={styles.rightColumn}>
                                    <div className={styles.decisionPanel}>
                                        <h3 className={styles.decisionTitle}>
                                            <MessageSquare size={20} />
                                            Decisão do Aprovador
                                        </h3>
                                        
                                        <div className={styles.observationField}>
                                            <label>Observações (opcional)</label>
                                            <textarea
                                                className={styles.observationTextarea}
                                                placeholder="Adicione observações sobre esta aprovação..."
                                                value={observacaoAprovador}
                                                onChange={(e) => setObservacaoAprovador(e.target.value)}
                                                rows={6}
                                            />
                                        </div>

                                        <div className={styles.actionButtons}>
                                            <button
                                                className={`${styles.btnAction} ${styles.btnApprove}`}
                                                onClick={handleAprovarClick}
                                                disabled={loading}
                                            >
                                                <CheckCircle size={20} />
                                                <span>Aprovar Orçamento</span>
                                            </button>
                                            
                                            <button
                                                className={`${styles.btnAction} ${styles.btnReject}`}
                                                onClick={handleRejeitarClick}
                                                disabled={loading}
                                            >
                                                <XCircle size={20} />
                                                <span>Rejeitar Orçamento</span>
                                            </button>
                                        </div>

                                        <button
                                            className={styles.btnBack}
                                            onClick={limparSelecao}
                                            disabled={loading}
                                        >
                                            <ArrowLeft size={18} />
                                            Voltar para Lista
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : abaAtiva === 'detalhes' ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p>Carregando detalhes do orçamento...</p>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <FileText size={48} />
                            <p>Selecione uma solicitação para iniciar a análise</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals de Confirmação */}
            <ConfirmModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={handleAprovarConfirm}
                title="Confirmar Aprovação"
                message="Tem certeza que deseja aprovar este orçamento?"
                itemName={`Orçamento #${solicitacaoSelecionada?.orcamentoId}`}
                confirmText="Sim, Aprovar"
                cancelText="Cancelar"
                variant="success"
            />

            <ConfirmModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleRejeitarConfirm}
                title="Confirmar Rejeição"
                message="Tem certeza que deseja rejeitar este orçamento?"
                itemName={`Orçamento #${solicitacaoSelecionada?.orcamentoId}`}
                confirmText="Sim, Rejeitar"
                cancelText="Cancelar"
            />

            {/* Modal de Preview de Imagem */}
            {imagemPreview && (
                <div 
                    className={styles.imageModal}
                    onClick={() => setImagemPreview(null)}
                >
                    <img 
                        src={imagemPreview} 
                        alt="Preview" 
                        className={styles.imageModalContent}
                    />
                </div>
            )}
        </div>
    );
}

export default AprovacaoCadastro;
