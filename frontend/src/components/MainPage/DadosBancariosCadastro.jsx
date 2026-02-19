import React, { useState, useEffect } from 'react';
import styles from './DadosBancariosCadastro.module.css';
import { dadosBancariosService } from '../../services/dadosBancariosService';
import ModalPesquisa from './ModalPesquisa';

function DadosBancariosCadastro() {
    const [dadosId, setDadosId] = useState('');
    const [codPrestador, setCodPrestador] = useState('');
    const [banco, setBanco] = useState('');
    const [tipoConta, setTipoConta] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    const [chavePix, setChavePix] = useState('');

    const [registros, setRegistros] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    // Estado para o modal de pesquisa de prestadores
    const [modalAberto, setModalAberto] = useState(false);

    useEffect(() => {
        carregarRegistros();
    }, []);

    const carregarRegistros = async () => {
        setLoading(true);
        try {
            const data = await dadosBancariosService.listar();
            console.log('Dados bancários recebidos:', data);
            const registrosFormatados = data.map(item => ({
                dadosId: item.dadosId || item.id,
                codPrestador: item.codPrestador,
                banco: item.banco,
                tipoConta: item.tipoConta,
                agencia: item.agencia,
                conta: item.conta,
                chavePix: item.chavePix
            }));
            setRegistros(registrosFormatados);
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
        const results = registros.filter(reg =>
            reg.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.codPrestador.toString().includes(searchTerm) ||
            reg.agencia.includes(searchTerm) ||
            reg.conta.includes(searchTerm) ||
            (reg.chavePix && reg.chavePix.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum registro encontrado'
        });
    };

    const selectRegistro = (registro) => {
        const index = registros.findIndex(r => r.dadosId === registro.dadosId);
        setCurrentIndex(index);
        setDadosId(registro.dadosId);
        setCodPrestador(registro.codPrestador);
        setBanco(registro.banco);
        setTipoConta(registro.tipoConta);
        setAgencia(registro.agencia);
        setConta(registro.conta);
        setChavePix(registro.chavePix);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    // Função chamada quando um prestador é selecionado no modal
    const handlePrestadorSelecionado = (prestadorId) => {
        setCodPrestador(prestadorId);
    };

    const handleSave = async () => {
        if (!codPrestador || !banco || !tipoConta || !agencia || !conta) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        const dados = {
            codPrestador: parseInt(codPrestador, 10),
            banco,
            tipoConta,
            agencia,
            conta,
            chavePix: chavePix || null
        };

        setLoading(true);
        try {
            if (dadosId) {
                const atualizado = await dadosBancariosService.atualizar(dadosId, dados);
                const registroMapeado = {
                    dadosId: atualizado.dadosId || atualizado.id,
                    codPrestador: atualizado.codPrestador,
                    banco: atualizado.banco,
                    tipoConta: atualizado.tipoConta,
                    agencia: atualizado.agencia,
                    conta: atualizado.conta,
                    chavePix: atualizado.chavePix
                };
                setRegistros(prev => prev.map(r => r.dadosId === dadosId ? registroMapeado : r));
                setMessage({ type: 'success', text: 'Dados bancários atualizados!' });
            } else {
                const novo = await dadosBancariosService.criar(dados);
                const novoMapeado = {
                    dadosId: novo.dadosId || novo.id,
                    codPrestador: novo.codPrestador,
                    banco: novo.banco,
                    tipoConta: novo.tipoConta,
                    agencia: novo.agencia,
                    conta: novo.conta,
                    chavePix: novo.chavePix
                };
                setRegistros(prev => {
                    const updated = [...prev, novoMapeado];
                    setCurrentIndex(updated.length - 1);
                    return updated;
                });
                setDadosId(novoMapeado.dadosId);
                setCodPrestador(novoMapeado.codPrestador);
                setBanco(novoMapeado.banco);
                setTipoConta(novoMapeado.tipoConta);
                setAgencia(novoMapeado.agencia);
                setConta(novoMapeado.conta);
                setChavePix(novoMapeado.chavePix);
                setMessage({ type: 'success', text: 'Dados bancários cadastrados!' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!dadosId) {
            setMessage({ type: 'error', text: 'Selecione um registro!' });
            return;
        }
        if (!window.confirm(`Excluir dados bancários do banco ${banco}?`)) return;

        setLoading(true);
        try {
            await dadosBancariosService.deletar(dadosId);
            const filtered = registros.filter(r => r.dadosId !== dadosId);
            setRegistros(filtered);
            if (filtered.length === 0) {
                clearForm();
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setDadosId(current.dadosId);
                setCodPrestador(current.codPrestador);
                setBanco(current.banco);
                setTipoConta(current.tipoConta);
                setAgencia(current.agencia);
                setConta(current.conta);
                setChavePix(current.chavePix);
            }
            setMessage({ type: 'success', text: 'Dados bancários excluídos!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setDadosId('');
        setCodPrestador('');
        setBanco('');
        setTipoConta('');
        setAgencia('');
        setConta('');
        setChavePix('');
        setCurrentIndex(-1);
        setMessage({ type: '', text: '' });
    };

    const handleNext = () => {
        if (currentIndex < registros.length - 1) {
            const next = registros[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);
            setDadosId(next.dadosId);
            setCodPrestador(next.codPrestador);
            setBanco(next.banco);
            setTipoConta(next.tipoConta);
            setAgencia(next.agencia);
            setConta(next.conta);
            setChavePix(next.chavePix);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prev = registros[currentIndex - 1];
            setCurrentIndex(currentIndex - 1);
            setDadosId(prev.dadosId);
            setCodPrestador(prev.codPrestador);
            setBanco(prev.banco);
            setTipoConta(prev.tipoConta);
            setAgencia(prev.agencia);
            setConta(prev.conta);
            setChavePix(prev.chavePix);
        }
    };

    return (
        <div className={styles.container}>
            {/* Modal de pesquisa de prestadores */}
            <ModalPesquisa
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                onSelect={handlePrestadorSelecionado}
            />

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>🏦</span>
                    <h2>Dados Bancários</h2>
                </div>
                {registros.length > 0 && (
                    <div className={styles.navigationGroup}>
                        <button className={styles.navButton} onClick={handlePrevious} disabled={currentIndex <= 0 || loading}>
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${registros.length}` : `0/${registros.length}`}
                        </span>
                        <button className={styles.navButton} onClick={handleNext} disabled={currentIndex >= registros.length - 1 || loading}>
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
                        placeholder="Pesquisar por banco, código do prestador, agência, conta ou chave Pix..."
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
                        {searchResults.map(reg => (
                            <div key={reg.dadosId} className={styles.resultItem} onClick={() => selectRegistro(reg)}>
                                <div className={styles.resultItemInfo}>
                                    <span className={styles.resultItemName}>{reg.banco}</span>
                                    <span className={styles.resultItemDoc}>Prestador: {reg.codPrestador} | Conta: {reg.conta}</span>
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
                        <label>ID</label>
                        <input type="text" value={dadosId || ''} disabled placeholder="Automático" />
                    </div>

                    {/* Campo CÓDIGO PRESTADOR com lupa */}
                    <div className={styles.formGroup}>
                        <label>CÓDIGO PRESTADOR *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={codPrestador || ''}
                                onChange={(e) => setCodPrestador(e.target.value)}
                                placeholder="Código do prestador"
                                disabled={loading}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalAberto(true)}
                                disabled={loading}
                                type="button"
                                title="Pesquisar prestador"
                            >
                                🔍
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>BANCO *</label>
                        <input
                            type="text"
                            value={banco || ''}
                            onChange={(e) => setBanco(e.target.value)}
                            placeholder="Nome do banco"
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TIPO DE CONTA *</label>
                        <input
                            type="text"
                            value={tipoConta || ''}
                            onChange={(e) => setTipoConta(e.target.value)}
                            placeholder="Corrente, Poupança, etc"
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>AGÊNCIA *</label>
                        <input
                            type="text"
                            value={agencia || ''}
                            onChange={(e) => setAgencia(e.target.value)}
                            placeholder="Número da agência"
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CONTA *</label>
                        <input
                            type="text"
                            value={conta || ''}
                            onChange={(e) => setConta(e.target.value)}
                            placeholder="Número da conta"
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CHAVE PIX</label>
                        <input
                            type="text"
                            value={chavePix || ''}
                            onChange={(e) => setChavePix(e.target.value)}
                            placeholder="Chave Pix (opcional)"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave} disabled={loading}>
                        <span>💾</span> {dadosId ? 'Atualizar' : 'Salvar'}
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

export default DadosBancariosCadastro;