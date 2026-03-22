import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Edit2, Trash2, Save, X, MapPin } from 'lucide-react';
import styles from './DadosBancariosCadastro-novo.module.css';
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
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});

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
            if (registrosFormatados.length > 0) {
                selecionarRegistro(registrosFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarRegistro = (registro, index) => {
        setCurrentIndex(index);
        setDadosId(registro.dadosId);
        setCodPrestador(registro.codPrestador);
        setBanco(registro.banco);
        setTipoConta(registro.tipoConta);
        setAgencia(registro.agencia);
        setConta(registro.conta);
        setChavePix(registro.chavePix || '');
        setOriginalData({ ...registro });
        setModo('visualizacao');
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
        selecionarRegistro(registro, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ dadosId, codPrestador, banco, tipoConta, agencia, conta, chavePix });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setDadosId('');
        setCodPrestador('');
        setBanco('');
        setTipoConta('');
        setAgencia('');
        setConta('');
        setChavePix('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.dadosId) {
            setDadosId(originalData.dadosId);
            setCodPrestador(originalData.codPrestador);
            setBanco(originalData.banco);
            setTipoConta(originalData.tipoConta);
            setAgencia(originalData.agencia);
            setConta(originalData.conta);
            setChavePix(originalData.chavePix || '');
        } else if (modo === 'criacao' && registros.length > 0 && currentIndex >= 0) {
            const registroAtual = registros[currentIndex];
            setDadosId(registroAtual.dadosId);
            setCodPrestador(registroAtual.codPrestador);
            setBanco(registroAtual.banco);
            setTipoConta(registroAtual.tipoConta);
            setAgencia(registroAtual.agencia);
            setConta(registroAtual.conta);
            setChavePix(registroAtual.chavePix || '');
        } else if (modo === 'criacao' && registros.length === 0) {
            setDadosId('');
            setCodPrestador('');
            setBanco('');
            setTipoConta('');
            setAgencia('');
            setConta('');
            setChavePix('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

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
            if (modo === 'edicao' && dadosId) {
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
                setOriginalData(registroMapeado);
                setMessage({ type: 'success', text: 'Dados bancários atualizados!' });
            } else if (modo === 'criacao') {
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
                    setTimeout(() => {
                        selecionarRegistro(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Dados bancários cadastrados!' });
            }
            setModo('visualizacao');
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
                setDadosId('');
                setCodPrestador('');
                setBanco('');
                setTipoConta('');
                setAgencia('');
                setConta('');
                setChavePix('');
                setCurrentIndex(-1);
                setOriginalData({});
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
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Dados bancários excluídos!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < registros.length - 1) {
            const next = registros[currentIndex + 1];
            selecionarRegistro(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = registros[currentIndex - 1];
            selecionarRegistro(prev, currentIndex - 1);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
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
                {registros.length > 0 && modo === 'visualizacao' && (
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
                            {currentIndex >= 0 ? `${currentIndex + 1}/${registros.length}` : `0/${registros.length}`}
                        </span>
                        <button
                            className={styles.navButton}
                            onClick={handleNext}
                            disabled={currentIndex >= registros.length - 1 || loading}
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
                            {currentIndex >= 0 ? `${currentIndex + 1}/${registros.length}` : `0/${registros.length}`}
                        </span>
                        <button className={styles.navButton} disabled>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Seção de pesquisa (só visível em modo visualização) */}
            {modo === 'visualizacao' && (
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
                            <Search size={18} /> Pesquisar
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className={styles.resultsList}>
                            {searchResults.map(reg => (
                                <div key={reg.dadosId} className={styles.resultItem} onClick={() => selectRegistro(reg)}>
                                    <div className={styles.resultItemInfo}>
                                        <span className={styles.resultItemName}>{reg.banco}</span>
                                        <span className={styles.resultItemDoc}>
                                            Prestador: {reg.codPrestador} | Conta: {reg.conta}
                                        </span>
                                    </div>
                                    <span>👉</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>ID</label>
                        <input type="text" value={dadosId || ''} disabled placeholder="Automático" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>CÓDIGO PRESTADOR *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={codPrestador || ''}
                                onChange={(e) => setCodPrestador(e.target.value)}
                                placeholder="Código do prestador"
                                disabled={camposDesabilitados}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalAberto(true)}
                                disabled={camposDesabilitados}
                                type="button"
                                title="Pesquisar prestador"
                            >
                                <Search size={16} />
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
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TIPO DE CONTA *</label>
                        <input
                            type="text"
                            value={tipoConta || ''}
                            onChange={(e) => setTipoConta(e.target.value)}
                            placeholder="Corrente, Poupança, etc"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>AGÊNCIA *</label>
                        <input
                            type="text"
                            value={agencia || ''}
                            onChange={(e) => setAgencia(e.target.value)}
                            placeholder="Número da agência"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CONTA *</label>
                        <input
                            type="text"
                            value={conta || ''}
                            onChange={(e) => setConta(e.target.value)}
                            placeholder="Número da conta"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CHAVE PIX</label>
                        <input
                            type="text"
                            value={chavePix || ''}
                            onChange={(e) => setChavePix(e.target.value)}
                            placeholder="Chave Pix (opcional)"
                            disabled={camposDesabilitados}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {modo === 'visualizacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnEdit}`}
                                onClick={handleEditar}
                                disabled={loading || !dadosId}
                                title="Editar dados bancários"
                            >
                                <Edit2 size={18} /> Editar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                                title="Criar novos dados bancários"
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
                                onClick={handleDelete}
                                disabled={loading}
                                title="Excluir dados bancários"
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
                                title="Salvar novos dados bancários"
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
        </div>
    );
}

export default DadosBancariosCadastro;