import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Edit2, Trash2, Save, X, CheckCircle } from 'lucide-react';
import styles from './SolicitacaoAprovacaoCadastro-novo.module.css';
import { solicitacaoAprovacaoService } from '../../services/solicitacaoAprovacaoService';
import ModalPesquisaOrcamento from './ModalPesquisaOrcamento';
import ConfirmModal from '../Shared/ConfirmModal';

function SolicitacaoAprovacaoCadastro() {
    const [solicitacaoAprovacaoId, setSolicitacaoAprovacaoId] = useState('');
    const [movimento, setMovimento] = useState('');
    const [movimentoDate, setMovimentoDate] = useState('');
    const [orcamentoId, setOrcamentoId] = useState('');
    const [statusSolicitacao, setStatusSolicitacao] = useState('');

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao');
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [modalOrcamentoAberto, setModalOrcamentoAberto] = useState(false);

    // Funções de formatação de data
    const formatarDataParaInput = (dataBR) => {
        if (!dataBR) return '';
        if (dataBR.includes('-') && dataBR.split('-')[0].length === 4) return dataBR;
        const partes = dataBR.split('/');
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            return `${ano}-${mes}-${dia}`;
        }
        return '';
    };

    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'APROVADO': return '#28a745';
            case 'REJEITADO': return '#dc3545';
            case 'PENDENTE': return '#ffc107';
            default: return '#6c757d';
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const carregarSolicitacoes = async () => {
        setLoading(true);
        try {
            const data = await solicitacaoAprovacaoService.listar();
            const solicitacoesFormatadas = data.map(item => ({
                solicitacaoAprovacaoId: item.solicitacaoAprovacaold || item.solicitacaoAprovacaoId,
                movimento: item.movimento,
                orcamentoId: item.orcamentold || item.orcamentoId,
                statusSolicitacao: item.statusSolicitacao || 'PENDENTE'
            }));
            setSolicitacoes(solicitacoesFormatadas);
            if (solicitacoesFormatadas.length > 0) {
                selecionarSolicitacao(solicitacoesFormatadas[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarSolicitacao = (solicitacao, index) => {
        setCurrentIndex(index);
        setSolicitacaoAprovacaoId(solicitacao.solicitacaoAprovacaoId);
        setMovimento(solicitacao.movimento);
        setMovimentoDate(formatarDataParaInput(solicitacao.movimento));
        setOrcamentoId(solicitacao.orcamentoId);
        setStatusSolicitacao(solicitacao.statusSolicitacao);
        setOriginalData({ ...solicitacao });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = solicitacoes.filter(sol =>
            sol.movimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sol.orcamentoId.toString().includes(searchTerm) ||
            sol.statusSolicitacao.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhuma solicitação encontrada'
        });
    };

    const selectSolicitacao = (solicitacao) => {
        const index = solicitacoes.findIndex(s => s.solicitacaoAprovacaoId === solicitacao.solicitacaoAprovacaoId);
        selecionarSolicitacao(solicitacao, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleOrcamentoSelecionado = (orcamentoId) => {
        setOrcamentoId(orcamentoId);
    };

    const handleEditar = () => {
        setOriginalData({
            solicitacaoAprovacaoId,
            movimento,
            orcamentoId,
            statusSolicitacao
        });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setSolicitacaoAprovacaoId('');
        setMovimento('');
        setMovimentoDate('');
        setOrcamentoId('');
        setStatusSolicitacao('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.solicitacaoAprovacaoId) {
            setSolicitacaoAprovacaoId(originalData.solicitacaoAprovacaoId);
            setMovimento(originalData.movimento);
            setMovimentoDate(formatarDataParaInput(originalData.movimento));
            setOrcamentoId(originalData.orcamentoId);
            setStatusSolicitacao(originalData.statusSolicitacao);
        } else if (modo === 'criacao' && solicitacoes.length > 0 && currentIndex >= 0) {
            const atual = solicitacoes[currentIndex];
            setSolicitacaoAprovacaoId(atual.solicitacaoAprovacaoId);
            setMovimento(atual.movimento);
            setMovimentoDate(formatarDataParaInput(atual.movimento));
            setOrcamentoId(atual.orcamentoId);
            setStatusSolicitacao(atual.statusSolicitacao);
        } else if (modo === 'criacao' && solicitacoes.length === 0) {
            setSolicitacaoAprovacaoId('');
            setMovimento('');
            setMovimentoDate('');
            setOrcamentoId('');
            setStatusSolicitacao('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!movimento || !orcamentoId) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        const dados = {
            movimento,
            orcamentoId: parseInt(orcamentoId, 10)
        };

        // Inclui status apenas em modo edição
        if (modo === 'edicao') {
            dados.statusSolicitacao = statusSolicitacao;
        }

        setLoading(true);
        try {
            if (modo === 'edicao' && solicitacaoAprovacaoId) {
                const atualizado = await solicitacaoAprovacaoService.atualizar(solicitacaoAprovacaoId, dados);
                const solicitacaoMapeada = {
                    solicitacaoAprovacaoId: atualizado.solicitacaoAprovacaold || atualizado.solicitacaoAprovacaoId,
                    movimento: atualizado.movimento,
                    orcamentoId: atualizado.orcamentold || atualizado.orcamentoId,
                    statusSolicitacao: atualizado.statusSolicitacao || 'PENDENTE'
                };
                setSolicitacoes(prev => prev.map(s => s.solicitacaoAprovacaoId === solicitacaoAprovacaoId ? solicitacaoMapeada : s));
                setOriginalData(solicitacaoMapeada);
                setMessage({ type: 'success', text: 'Solicitação atualizada!' });
            } else if (modo === 'criacao') {
                const novo = await solicitacaoAprovacaoService.criar(dados);
                const novoMapeado = {
                    solicitacaoAprovacaoId: novo.solicitacaoAprovacaold || novo.solicitacaoAprovacaoId,
                    movimento: novo.movimento,
                    orcamentoId: novo.orcamentold || novo.orcamentoId,
                    statusSolicitacao: novo.statusSolicitacao || 'PENDENTE'
                };
                setSolicitacoes(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarSolicitacao(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Solicitação cadastrada!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!solicitacaoAprovacaoId) {
            setMessage({ type: 'error', text: 'Selecione uma solicitação!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await solicitacaoAprovacaoService.deletar(solicitacaoAprovacaoId);
            const filtered = solicitacoes.filter(s => s.solicitacaoAprovacaoId !== solicitacaoAprovacaoId);
            setSolicitacoes(filtered);
            if (filtered.length === 0) {
                setSolicitacaoAprovacaoId('');
                setMovimento('');
                setMovimentoDate('');
                setOrcamentoId('');
                setStatusSolicitacao('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) newIndex = filtered.length - 1;
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setSolicitacaoAprovacaoId(current.solicitacaoAprovacaoId);
                setMovimento(current.movimento);
                setMovimentoDate(formatarDataParaInput(current.movimento));
                setOrcamentoId(current.orcamentoId);
                setStatusSolicitacao(current.statusSolicitacao);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Solicitação excluída!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < solicitacoes.length - 1) {
            const next = solicitacoes[currentIndex + 1];
            selecionarSolicitacao(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = solicitacoes[currentIndex - 1];
            selecionarSolicitacao(prev, currentIndex - 1);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <ModalPesquisaOrcamento
                isOpen={modalOrcamentoAberto}
                onClose={() => setModalOrcamentoAberto(false)}
                onSelect={handleOrcamentoSelecionado}
            />

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>📋</span>
                    <h2>Solicitação de Aprovação</h2>
                </div>
                {solicitacoes.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.navigationGroup}>
                        <button
                            className={styles.navButton}
                            onClick={handlePrevious}
                            disabled={currentIndex <= 0 || loading}
                            title="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${solicitacoes.length}` : `0/${solicitacoes.length}`}
                        </span>
                        <button
                            className={styles.navButton}
                            onClick={handleNext}
                            disabled={currentIndex >= solicitacoes.length - 1 || loading}
                            title="Próximo"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                        <button className={styles.navButton} disabled>
                            <ChevronLeft size={20} />
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${solicitacoes.length}` : `0/${solicitacoes.length}`}
                        </span>
                        <button className={styles.navButton} disabled>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Pesquisar por movimento, ID do orçamento ou status..."
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={loading || modo !== 'visualizacao'}
                    />
                    <button
                        className={styles.searchButton}
                        onClick={handleSearch}
                        disabled={loading || modo !== 'visualizacao'}
                    >
                        <Search size={18} /> Pesquisar
                    </button>
                </div>
                {searchResults.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.resultsList}>
                        {searchResults.map(sol => (
                            <div key={sol.solicitacaoAprovacaoId} className={styles.resultItem} onClick={() => selectSolicitacao(sol)}>
                                <div className={styles.resultItemInfo}>
                                    <span className={styles.resultItemName}>Solicitação #{sol.solicitacaoAprovacaoId}</span>
                                    <span className={styles.resultItemDoc}>
                                        Orçamento: {sol.orcamentoId} | Data: {sol.movimento} | Status: {sol.statusSolicitacao}
                                    </span>
                                </div>
                                <span>👉</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>ID SOLICITAÇÃO</label>
                        <input type="text" value={solicitacaoAprovacaoId || ''} disabled placeholder="Automático" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>MOVIMENTO *</label>
                        <div className={styles.dateInputGroup}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={movimentoDate}
                                onChange={(e) => {
                                    const dataSelecionada = e.target.value;
                                    setMovimentoDate(dataSelecionada);
                                    if (dataSelecionada) {
                                        const [ano, mes, dia] = dataSelecionada.split('-');
                                        setMovimento(`${dia}/${mes}/${ano}`);
                                    } else {
                                        setMovimento('');
                                    }
                                }}
                                disabled={camposDesabilitados}
                            />
                            {movimento && (
                                <span className={styles.dateDisplay}>
                                    Data selecionada: {movimento}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>ID ORÇAMENTO *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={orcamentoId || ''}
                                onChange={(e) => setOrcamentoId(e.target.value)}
                                placeholder="Código do orçamento"
                                disabled={camposDesabilitados}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalOrcamentoAberto(true)}
                                disabled={loading || camposDesabilitados}
                                type="button"
                                title="Pesquisar orçamento"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Campo STATUS condicional */}
                    <div className={styles.formGroup}>
                        <label>STATUS</label>
                        {modo === 'edicao' ? (
                            <select
                                className={styles.statusSelect}
                                value={statusSolicitacao}
                                onChange={(e) => setStatusSolicitacao(e.target.value)}
                                disabled={loading}
                            >
                                <option value="PENDENTE">PENDENTE</option>
                                <option value="APROVADO">APROVADO</option>
                                <option value="REJEITADO">REJEITADO</option>
                            </select>
                        ) : (
                            <div
                                className={styles.statusDisplay}
                                style={{
                                    backgroundColor: getStatusColor(statusSolicitacao),
                                    color: 'white',
                                    padding: '10px var(--spacing-md)',
                                    borderRadius: 'var(--border-radius-sm)',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    height: '45px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {statusSolicitacao || '---'}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {modo === 'visualizacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnEdit}`}
                                onClick={handleEditar}
                                disabled={loading || !solicitacaoAprovacaoId}
                                title="Editar solicitação"
                            >
                                <Edit2 size={18} /> Editar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                                title="Criar nova solicitação"
                            >
                                <Plus size={18} /> Novo
                            </button>
                        </>
                    )}
                    {modo === 'edicao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                                title="Salvar alterações"
                            >
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnDelete}`}
                                onClick={handleDeleteClick}
                                disabled={loading || !solicitacaoAprovacaoId}
                                title="Excluir solicitação"
                            >
                                <Trash2 size={18} /> Excluir
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar edição"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </>
                    )}
                    {modo === 'criacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                                title="Salvar nova solicitação"
                            >
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar criação"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </>
                    )}
                </div>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta solicitação de aprovação? Esta ação não pode ser desfeita."
                itemName={`Solicitação #${solicitacaoAprovacaoId}`}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default SolicitacaoAprovacaoCadastro;