import React, { useState, useEffect } from 'react';
import styles from './SolicitacaoAprovacaoCadastro.module.css';
import { solicitacaoAprovacaoService } from '../../services/solicitacaoAprovacaoService';
import ModalPesquisaOrcamento from './ModalPesquisaOrcamento';

function SolicitacaoAprovacaoCadastro() {
    const [solicitacaoAprovacaoId, setSolicitacaoAprovacaoId] = useState('');
    const [movimento, setMovimento] = useState('');
    const [movimentoDate, setMovimentoDate] = useState('');
    const [orcamentoId, setOrcamentoId] = useState('');
    const [statusSolicitacao, setStatusSolicitacao] = useState(''); // Novo estado para status

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

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

    // Função para definir a cor do status
    const getStatusColor = (status) => {
        switch(status?.toUpperCase()) {
            case 'APROVADO':
                return '#28a745'; // verde
            case 'REJEITADO':
                return '#dc3545'; // vermelho
            case 'PENDENTE':
                return '#ffc107'; // amarelo
            default:
                return '#6c757d'; // cinza
        }
    };

    useEffect(() => {
        carregarSolicitacoes();
    }, []);

    const carregarSolicitacoes = async () => {
        setLoading(true);
        try {
            const data = await solicitacaoAprovacaoService.listar();
            console.log('Solicitações recebidas:', data);
            const solicitacoesFormatadas = data.map(item => ({
                solicitacaoAprovacaoId: item.solicitacaoAprovacaold || item.solicitacaoAprovacaoId,
                movimento: item.movimento,
                orcamentoId: item.orcamentold || item.orcamentoId,
                statusSolicitacao: item.statusSolicitacao || 'PENDENTE' // Valor padrão se não vier
            }));
            setSolicitacoes(solicitacoesFormatadas);
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
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
        setCurrentIndex(index);
        setSolicitacaoAprovacaoId(solicitacao.solicitacaoAprovacaoId);
        setMovimento(solicitacao.movimento);
        setMovimentoDate(formatarDataParaInput(solicitacao.movimento));
        setOrcamentoId(solicitacao.orcamentoId);
        setStatusSolicitacao(solicitacao.statusSolicitacao); // Preenche o status
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleOrcamentoSelecionado = (orcamentoId) => {
        setOrcamentoId(orcamentoId);
    };

    const handleSave = async () => {
        if (!movimento || !orcamentoId) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        // APENAS OS CAMPOS NECESSÁRIOS PARA O POST
        const dados = {
            movimento,
            orcamentoId: parseInt(orcamentoId, 10)
        };

        console.log('Enviando dados:', dados);

        setLoading(true);
        try {
            if (solicitacaoAprovacaoId) {
                const atualizado = await solicitacaoAprovacaoService.atualizar(solicitacaoAprovacaoId, dados);
                const solicitacaoMapeada = {
                    solicitacaoAprovacaoId: atualizado.solicitacaoAprovacaold || atualizado.solicitacaoAprovacaoId,
                    movimento: atualizado.movimento,
                    orcamentoId: atualizado.orcamentold || atualizado.orcamentoId,
                    statusSolicitacao: atualizado.statusSolicitacao || 'PENDENTE'
                };
                setSolicitacoes(prev => prev.map(s => s.solicitacaoAprovacaoId === solicitacaoAprovacaoId ? solicitacaoMapeada : s));
                setStatusSolicitacao(solicitacaoMapeada.statusSolicitacao); // Atualiza o status exibido
                setMessage({ type: 'success', text: 'Solicitação atualizada!' });
            } else {
                const novo = await solicitacaoAprovacaoService.criar(dados);
                const novoMapeado = {
                    solicitacaoAprovacaoId: novo.solicitacaoAprovacaold || novo.solicitacaoAprovacaoId,
                    movimento: novo.movimento,
                    orcamentoId: novo.orcamentold || novo.orcamentoId,
                    statusSolicitacao: novo.statusSolicitacao || 'PENDENTE'
                };
                setSolicitacoes(prev => {
                    const updated = [...prev, novoMapeado];
                    setCurrentIndex(updated.length - 1);
                    return updated;
                });
                setSolicitacaoAprovacaoId(novoMapeado.solicitacaoAprovacaoId);
                setMovimento(novoMapeado.movimento);
                setMovimentoDate(formatarDataParaInput(novoMapeado.movimento));
                setOrcamentoId(novoMapeado.orcamentoId);
                setStatusSolicitacao(novoMapeado.statusSolicitacao);
                setMessage({ type: 'success', text: 'Solicitação cadastrada!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!solicitacaoAprovacaoId) {
            setMessage({ type: 'error', text: 'Selecione uma solicitação!' });
            return;
        }
        if (!window.confirm(`Excluir solicitação ${solicitacaoAprovacaoId}?`)) return;

        setLoading(true);
        try {
            await solicitacaoAprovacaoService.deletar(solicitacaoAprovacaoId);
            const filtered = solicitacoes.filter(s => s.solicitacaoAprovacaoId !== solicitacaoAprovacaoId);
            setSolicitacoes(filtered);
            if (filtered.length === 0) {
                clearForm();
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setSolicitacaoAprovacaoId(current.solicitacaoAprovacaoId);
                setMovimento(current.movimento);
                setMovimentoDate(formatarDataParaInput(current.movimento));
                setOrcamentoId(current.orcamentoId);
                setStatusSolicitacao(current.statusSolicitacao);
            }
            setMessage({ type: 'success', text: 'Solicitação excluída!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setSolicitacaoAprovacaoId('');
        setMovimento('');
        setMovimentoDate('');
        setOrcamentoId('');
        setStatusSolicitacao('');
        setCurrentIndex(-1);
        setMessage({ type: '', text: '' });
    };

    const handleNext = () => {
        if (currentIndex < solicitacoes.length - 1) {
            const next = solicitacoes[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);
            setSolicitacaoAprovacaoId(next.solicitacaoAprovacaoId);
            setMovimento(next.movimento);
            setMovimentoDate(formatarDataParaInput(next.movimento));
            setOrcamentoId(next.orcamentoId);
            setStatusSolicitacao(next.statusSolicitacao);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prev = solicitacoes[currentIndex - 1];
            setCurrentIndex(currentIndex - 1);
            setSolicitacaoAprovacaoId(prev.solicitacaoAprovacaoId);
            setMovimento(prev.movimento);
            setMovimentoDate(formatarDataParaInput(prev.movimento));
            setOrcamentoId(prev.orcamentoId);
            setStatusSolicitacao(prev.statusSolicitacao);
        }
    };

    return (
        <div className={styles.container}>
            {/* Modal de pesquisa de orçamentos */}
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
                {solicitacoes.length > 0 && (
                    <div className={styles.navigationGroup}>
                        <button className={styles.navButton} onClick={handlePrevious} disabled={currentIndex <= 0 || loading}>
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${solicitacoes.length}` : `0/${solicitacoes.length}`}
                        </span>
                        <button className={styles.navButton} onClick={handleNext} disabled={currentIndex >= solicitacoes.length - 1 || loading}>
                            ▶
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
                        disabled={loading}
                    />
                    <button className={styles.searchButton} onClick={handleSearch} disabled={loading}>
                        <span>🔍</span> Pesquisar
                    </button>
                </div>
                {searchResults.length > 0 && (
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
                                disabled={loading}
                            />
                            {movimento && (
                                <span className={styles.dateDisplay}>
                                    Data selecionada: {movimento}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Campo ORÇAMENTO ID com lupa */}
                    <div className={styles.formGroup}>
                        <label>ID ORÇAMENTO *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={orcamentoId || ''}
                                onChange={(e) => setOrcamentoId(e.target.value)}
                                placeholder="Código do orçamento"
                                disabled={loading}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalOrcamentoAberto(true)}
                                disabled={loading}
                                type="button"
                                title="Pesquisar orçamento"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    {/* Campo STATUS - SOMENTE LEITURA */}
                    <div className={styles.formGroup}>
                        <label>STATUS</label>
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
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave} disabled={loading}>
                        <span>💾</span> {solicitacaoAprovacaoId ? 'Atualizar' : 'Salvar'}
                    </button>
                    <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete} disabled={loading}>
                        <span>🗑️</span> Excluir
                    </button>
                    <button className={`${styles.btn} ${styles.btnClear}`} onClick={clearForm} disabled={loading}>
                        <span>🔄</span> Novo
                    </button>
                </div>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SolicitacaoAprovacaoCadastro;