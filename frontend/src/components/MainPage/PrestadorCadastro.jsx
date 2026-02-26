import React, { useState, useEffect } from 'react';
import styles from './PrestadorCadastro.module.css';
import { prestadorService } from '../../services/prestadorService';

function PrestadorCadastro() {
    const [codPrestador, setCodPrestador] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');

    const [prestadores, setPrestadores] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        carregarPrestadores();
    }, []);

    const carregarPrestadores = async () => {
        setLoading(true);
        try {
            const data = await prestadorService.listar();
            console.log('Prestadores recebidos:', data);
            const prestadoresFormatados = data.map(item => ({
                id: item.cod_prestador,
                nome: item.nome,
                cpf: item.cpf
            }));
            setPrestadores(prestadoresFormatados);
            if (prestadoresFormatados.length > 0) {
                selecionarPrestador(prestadoresFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarPrestador = (prestador, index) => {
        setCurrentIndex(index);
        setCodPrestador(prestador.id);
        setNome(prestador.nome);
        setCpf(prestador.cpf);
        setOriginalData({ ...prestador });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = prestadores.filter(prest =>
            prest.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prest.cpf.includes(searchTerm)
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum prestador encontrado'
        });
    };

    const selectPrestador = (prestador) => {
        const index = prestadores.findIndex(p => p.id === prestador.id);
        selecionarPrestador(prestador, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ id: codPrestador, nome, cpf });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setCodPrestador('');
        setNome('');
        setCpf('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setCodPrestador(originalData.id);
            setNome(originalData.nome);
            setCpf(originalData.cpf);
        } else if (modo === 'criacao' && prestadores.length > 0 && currentIndex >= 0) {
            const atual = prestadores[currentIndex];
            setCodPrestador(atual.id);
            setNome(atual.nome);
            setCpf(atual.cpf);
        } else if (modo === 'criacao' && prestadores.length === 0) {
            setCodPrestador('');
            setNome('');
            setCpf('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!nome || !cpf) {
            setMessage({ type: 'error', text: 'Preencha nome e CPF!' });
            return;
        }

        const dados = { nome, cpf };

        setLoading(true);
        try {
            if (modo === 'edicao' && codPrestador) {
                const atualizado = await prestadorService.atualizar(codPrestador, dados);
                const prestadorMapeado = {
                    id: atualizado.cod_prestador,
                    nome: atualizado.nome,
                    cpf: atualizado.cpf
                };
                setPrestadores(prev => prev.map(p => p.id === codPrestador ? prestadorMapeado : p));
                setOriginalData(prestadorMapeado);
                setMessage({ type: 'success', text: 'Prestador atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await prestadorService.criar(dados);
                const novoMapeado = {
                    id: novo.cod_prestador,
                    nome: novo.nome,
                    cpf: novo.cpf
                };
                setPrestadores(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarPrestador(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Prestador cadastrado!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!codPrestador) {
            setMessage({ type: 'error', text: 'Selecione um prestador!' });
            return;
        }
        if (!window.confirm(`Excluir ${nome}?`)) return;

        setLoading(true);
        try {
            await prestadorService.deletar(codPrestador);
            const filtered = prestadores.filter(p => p.id !== codPrestador);
            setPrestadores(filtered);
            if (filtered.length === 0) {
                setCodPrestador('');
                setNome('');
                setCpf('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setCodPrestador(current.id);
                setNome(current.nome);
                setCpf(current.cpf);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Prestador excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < prestadores.length - 1) {
            const next = prestadores[currentIndex + 1];
            selecionarPrestador(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = prestadores[currentIndex - 1];
            selecionarPrestador(prev, currentIndex - 1);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>👤</span>
                    <h2>Cadastro de Prestador</h2>
                </div>
                {prestadores.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.navigationGroup}>
                        <button
                            className={styles.navButton}
                            onClick={handlePrevious}
                            disabled={currentIndex <= 0 || loading}
                        >
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${prestadores.length}` : `0/${prestadores.length}`}
                        </span>
                        <button
                            className={styles.navButton}
                            onClick={handleNext}
                            disabled={currentIndex >= prestadores.length - 1 || loading}
                        >
                            ▶
                        </button>
                    </div>
                )}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                        <button className={styles.navButton} disabled>◀</button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${prestadores.length}` : `0/${prestadores.length}`}
                        </span>
                        <button className={styles.navButton} disabled>▶</button>
                    </div>
                )}
            </div>

            {/* Pesquisa visível apenas no modo visualização */}
            {modo === 'visualizacao' && (
                <div className={styles.searchSection}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Pesquisar por nome ou CPF..."
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
                            {searchResults.map(prest => (
                                <div key={prest.id} className={styles.resultItem} onClick={() => selectPrestador(prest)}>
                                    <div className={styles.resultItemInfo}>
                                        <span className={styles.resultItemName}>{prest.nome}</span>
                                        <span className={styles.resultItemDoc}>CPF: {prest.cpf}</span>
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
                        <label>CÓDIGO</label>
                        <input type="text" value={codPrestador || ''} disabled placeholder="Automático" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>NOME *</label>
                        <input
                            type="text"
                            value={nome || ''}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o nome do prestador"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CPF *</label>
                        <input
                            type="text"
                            value={cpf || ''}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
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
                                disabled={loading || !codPrestador}
                            >
                                <span>✏️</span> Editar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                            >
                                <span>➕</span> Novo
                            </button>
                        </>
                    )}
                    {modo === 'edicao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <span>💾</span> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnDelete}`}
                                onClick={handleDelete}
                                disabled={loading || !codPrestador}
                            >
                                <span>🗑️</span> Excluir
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                            >
                                <span>❌</span> Cancelar
                            </button>
                        </>
                    )}
                    {modo === 'criacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                            >
                                <span>💾</span> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                            >
                                <span>❌</span> Cancelar
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

export default PrestadorCadastro;