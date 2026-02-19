import React, { useState, useEffect } from 'react';
import styles from './OrcamentoCadastro.module.css';
import { orcamentoService } from '../../services/orcamentoService';
import ModalPesquisa from './ModalPesquisa';
import ModalPesquisaEmpresa from './ModalPesquisaEmpresa';

function OrcamentoCadastro() {
    const [orcamentoID, setOrcamentoID] = useState('');
    const [movimento, setMovimento] = useState('');
    const [movimentoDate, setMovimentoDate] = useState(''); // Para o input date
    const [idPrestador, setIdPrestador] = useState('');
    const [empresaID, setEmpresaID] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');

    const [orcamentos, setOrcamentos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const [modalPrestadorAberto, setModalPrestadorAberto] = useState(false);
    const [modalEmpresaAberto, setModalEmpresaAberto] = useState(false);

    // Funções de formatação de data
    const formatarDataParaExibicao = (dataISO) => {
        if (!dataISO) return '';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    };

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

    useEffect(() => {
        carregarOrcamentos();
    }, []);

    const carregarOrcamentos = async () => {
        setLoading(true);
        try {
            const data = await orcamentoService.listar();
            console.log('Orçamentos recebidos:', data);
            const orcamentosFormatados = data.map(item => ({
                orcamentoID: item.orcamentoID,
                movimento: item.movimento,
                idPrestador: item.idPrestador,
                empresaID: item.empresaID,
                descricao: item.descricao,
                valor: item.valor
            }));
            setOrcamentos(orcamentosFormatados);
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
        const results = orcamentos.filter(orc =>
            orc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orc.movimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orc.idPrestador.toString().includes(searchTerm) ||
            orc.empresaID.toString().includes(searchTerm)
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum orçamento encontrado'
        });
    };

    const selectOrcamento = (orcamento) => {
        const index = orcamentos.findIndex(o => o.orcamentoID === orcamento.orcamentoID);
        setCurrentIndex(index);
        setOrcamentoID(orcamento.orcamentoID);

        // Atualiza movimento e movimentoDate
        setMovimento(orcamento.movimento);
        setMovimentoDate(formatarDataParaInput(orcamento.movimento));

        setIdPrestador(orcamento.idPrestador);
        setEmpresaID(orcamento.empresaID);
        setDescricao(orcamento.descricao);
        setValor(orcamento.valor);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handlePrestadorSelecionado = (prestadorId) => {
        setIdPrestador(prestadorId);
    };

    const handleEmpresaSelecionada = (empresaId) => {
        setEmpresaID(empresaId);
    };

    const handleSave = async () => {
        if (!movimento || !idPrestador || !empresaID || !descricao || !valor) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        const dados = {
            movimento,
            idPrestador: parseInt(idPrestador, 10),
            empresaID: parseInt(empresaID, 10),
            descricao,
            valor: parseFloat(valor)
        };

        setLoading(true);
        try {
            if (orcamentoID) {
                const atualizado = await orcamentoService.atualizar(orcamentoID, dados);
                const orcamentoMapeado = {
                    orcamentoID: atualizado.orcamentoID,
                    movimento: atualizado.movimento,
                    idPrestador: atualizado.idPrestador,
                    empresaID: atualizado.empresaID,
                    descricao: atualizado.descricao,
                    valor: atualizado.valor
                };
                setOrcamentos(prev => prev.map(o => o.orcamentoID === orcamentoID ? orcamentoMapeado : o));
                setMessage({ type: 'success', text: 'Orçamento atualizado!' });
            } else {
                const novo = await orcamentoService.criar(dados);
                const novoMapeado = {
                    orcamentoID: novo.orcamentoID,
                    movimento: novo.movimento,
                    idPrestador: novo.idPrestador,
                    empresaID: novo.empresaID,
                    descricao: novo.descricao,
                    valor: novo.valor
                };
                setOrcamentos(prev => {
                    const updated = [...prev, novoMapeado];
                    setCurrentIndex(updated.length - 1);
                    return updated;
                });
                setOrcamentoID(novoMapeado.orcamentoID);
                setMovimento(novoMapeado.movimento);
                setMovimentoDate(formatarDataParaInput(novoMapeado.movimento));
                setIdPrestador(novoMapeado.idPrestador);
                setEmpresaID(novoMapeado.empresaID);
                setDescricao(novoMapeado.descricao);
                setValor(novoMapeado.valor);
                setMessage({ type: 'success', text: 'Orçamento cadastrado!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!orcamentoID) {
            setMessage({ type: 'error', text: 'Selecione um orçamento!' });
            return;
        }
        if (!window.confirm(`Excluir orçamento ${orcamentoID}?`)) return;

        setLoading(true);
        try {
            await orcamentoService.deletar(orcamentoID);
            const filtered = orcamentos.filter(o => o.orcamentoID !== orcamentoID);
            setOrcamentos(filtered);
            if (filtered.length === 0) {
                clearForm();
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setOrcamentoID(current.orcamentoID);
                setMovimento(current.movimento);
                setMovimentoDate(formatarDataParaInput(current.movimento));
                setIdPrestador(current.idPrestador);
                setEmpresaID(current.empresaID);
                setDescricao(current.descricao);
                setValor(current.valor);
            }
            setMessage({ type: 'success', text: 'Orçamento excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setOrcamentoID('');
        setMovimento('');
        setMovimentoDate('');
        setIdPrestador('');
        setEmpresaID('');
        setDescricao('');
        setValor('');
        setCurrentIndex(-1);
        setMessage({ type: '', text: '' });
    };

    const handleNext = () => {
        if (currentIndex < orcamentos.length - 1) {
            const next = orcamentos[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);
            setOrcamentoID(next.orcamentoID);
            setMovimento(next.movimento);
            setMovimentoDate(formatarDataParaInput(next.movimento));
            setIdPrestador(next.idPrestador);
            setEmpresaID(next.empresaID);
            setDescricao(next.descricao);
            setValor(next.valor);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prev = orcamentos[currentIndex - 1];
            setCurrentIndex(currentIndex - 1);
            setOrcamentoID(prev.orcamentoID);
            setMovimento(prev.movimento);
            setMovimentoDate(formatarDataParaInput(prev.movimento));
            setIdPrestador(prev.idPrestador);
            setEmpresaID(prev.empresaID);
            setDescricao(prev.descricao);
            setValor(prev.valor);
        }
    };

    const formatarValor = (value) => {
        const numero = parseFloat(value);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className={styles.container}>
            <ModalPesquisa
                isOpen={modalPrestadorAberto}
                onClose={() => setModalPrestadorAberto(false)}
                onSelect={handlePrestadorSelecionado}
            />
            <ModalPesquisaEmpresa
                isOpen={modalEmpresaAberto}
                onClose={() => setModalEmpresaAberto(false)}
                onSelect={handleEmpresaSelecionada}
            />

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>💰</span>
                    <h2>Orçamentos</h2>
                </div>
                {orcamentos.length > 0 && (
                    <div className={styles.navigationGroup}>
                        <button className={styles.navButton} onClick={handlePrevious} disabled={currentIndex <= 0 || loading}>
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${orcamentos.length}` : `0/${orcamentos.length}`}
                        </span>
                        <button className={styles.navButton} onClick={handleNext} disabled={currentIndex >= orcamentos.length - 1 || loading}>
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
                        placeholder="Pesquisar por descrição, movimento, prestador ou empresa..."
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
                        {searchResults.map(orc => (
                            <div key={orc.orcamentoID} className={styles.resultItem} onClick={() => selectOrcamento(orc)}>
                                <div className={styles.resultItemInfo}>
                                    <span className={styles.resultItemName}>{orc.descricao}</span>
                                    <span className={styles.resultItemDoc}>
                                        Data: {orc.movimento} | Valor: {formatarValor(orc.valor)}
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
                        <label>ID ORÇAMENTO</label>
                        <input type="text" value={orcamentoID || ''} disabled placeholder="Automático" />
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

                    <div className={styles.formGroup}>
                        <label>ID PRESTADOR *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={idPrestador || ''}
                                onChange={(e) => setIdPrestador(e.target.value)}
                                placeholder="Código do prestador"
                                disabled={loading}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalPrestadorAberto(true)}
                                disabled={loading}
                                type="button"
                                title="Pesquisar prestador"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>EMPRESA ID *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={empresaID || ''}
                                onChange={(e) => setEmpresaID(e.target.value)}
                                placeholder="Código da empresa"
                                disabled={loading}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalEmpresaAberto(true)}
                                disabled={loading}
                                type="button"
                                title="Pesquisar empresa"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>DESCRIÇÃO *</label>
                        <textarea
                            value={descricao || ''}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descrição do orçamento"
                            disabled={loading}
                            rows={4}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.valorField}`}>
                        <label>VALOR *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={valor || ''}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="0,00"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave} disabled={loading}>
                        <span>💾</span> {orcamentoID ? 'Atualizar' : 'Salvar'}
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

export default OrcamentoCadastro;