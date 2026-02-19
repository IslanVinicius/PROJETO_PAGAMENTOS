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
        setCurrentIndex(index);
        setCodPrestador(prestador.id);
        setNome(prestador.nome);
        setCpf(prestador.cpf);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!nome || !cpf) {
            setMessage({ type: 'error', text: 'Preencha nome e CPF!' });
            return;
        }

        const dados = {
            nome: nome,
            cpf: cpf
        };

        setLoading(true);
        try {
            if (codPrestador) {
                const atualizado = await prestadorService.atualizar(codPrestador, dados);
                const prestadorMapeado = {
                    id: atualizado.cod_prestador,
                    nome: atualizado.nome,
                    cpf: atualizado.cpf
                };
                setPrestadores(prev => prev.map(p => p.id === codPrestador ? prestadorMapeado : p));
                setMessage({ type: 'success', text: 'Prestador atualizado!' });
            } else {
                const novo = await prestadorService.criar(dados);
                const novoMapeado = {
                    id: novo.cod_prestador,
                    nome: novo.nome,
                    cpf: novo.cpf
                };
                setPrestadores(prev => {
                    const updated = [...prev, novoMapeado];
                    setCurrentIndex(updated.length - 1);
                    return updated;
                });
                setCodPrestador(novoMapeado.id);
                setNome(novoMapeado.nome);
                setCpf(novoMapeado.cpf);
                setMessage({ type: 'success', text: 'Prestador cadastrado!' });
            }
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
                clearForm();
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
            }
            setMessage({ type: 'success', text: 'Prestador excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setCodPrestador('');
        setNome('');
        setCpf('');
        setCurrentIndex(-1);
        setMessage({ type: '', text: '' });
    };

    const handleNext = () => {
        if (currentIndex < prestadores.length - 1) {
            const next = prestadores[currentIndex + 1];
            setCurrentIndex(currentIndex + 1);
            setCodPrestador(next.id);
            setNome(next.nome);
            setCpf(next.cpf);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const prev = prestadores[currentIndex - 1];
            setCurrentIndex(currentIndex - 1);
            setCodPrestador(prev.id);
            setNome(prev.nome);
            setCpf(prev.cpf);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>👤</span>
                    <h2>Cadastro de Prestador</h2>
                </div>
                {prestadores.length > 0 && (
                    <div className={styles.navigationGroup}>
                        <button className={styles.navButton} onClick={handlePrevious} disabled={currentIndex <= 0 || loading}>
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${prestadores.length}` : `0/${prestadores.length}`}
                        </span>
                        <button className={styles.navButton} onClick={handleNext} disabled={currentIndex >= prestadores.length - 1 || loading}>
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
                            disabled={loading}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CPF *</label>
                        <input
                            type="text"
                            value={cpf || ''}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleSave} disabled={loading}>
                        <span>💾</span> {codPrestador ? 'Atualizar' : 'Salvar'}
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

export default PrestadorCadastro;