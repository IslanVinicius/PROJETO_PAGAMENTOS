import React, { useState, useEffect } from 'react';
import styles from './EmpresaCadastro.module.css';
import { empresaService } from '../../services/empresaService';

function EmpresaCadastro() {
    // Estados dos campos
    const [idEmpresa, setIdEmpresa] = useState('');
    const [nome, setNome] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [razao, setRazao] = useState('');

    // Estados de controle
    const [empresas, setEmpresas] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'

    // Para armazenar dados originais durante edição (para cancelar)
    const [originalData, setOriginalData] = useState({});

    useEffect(() => {
        carregarEmpresas();
    }, []);

    const carregarEmpresas = async () => {
        setLoading(true);
        try {
            const data = await empresaService.listar();
            const empresasFormatadas = data.map(item => ({
                id: item.idEmpresa,
                nome: item.nome,
                cnpj: item.cnpj,
                razao: item.razao || ''
            }));
            setEmpresas(empresasFormatadas);
            if (empresasFormatadas.length > 0) {
                // Seleciona o primeiro registro ao carregar
                selecionarEmpresa(empresasFormatadas[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarEmpresa = (empresa, index) => {
        setCurrentIndex(index);
        setIdEmpresa(empresa.id);
        setNome(empresa.nome);
        setCnpj(empresa.cnpj);
        setRazao(empresa.razao || '');
        setOriginalData({ ...empresa }); // salva cópia para cancelar
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = empresas.filter(emp =>
            emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.cnpj.includes(searchTerm) ||
            (emp.razao && emp.razao.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrada(s)` : 'Nenhuma empresa encontrada'
        });
    };

    const selectEmpresa = (empresa) => {
        const index = empresas.findIndex(e => e.id === empresa.id);
        selecionarEmpresa(empresa, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ id: idEmpresa, nome, cnpj, razao });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({}); // limpa referência
        setIdEmpresa('');
        setNome('');
        setCnpj('');
        setRazao('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            // Restaura dados originais
            setIdEmpresa(originalData.id);
            setNome(originalData.nome);
            setCnpj(originalData.cnpj);
            setRazao(originalData.razao || '');
        } else if (modo === 'criacao' && empresas.length > 0 && currentIndex >= 0) {
            // Volta para o registro atual
            const empresaAtual = empresas[currentIndex];
            setIdEmpresa(empresaAtual.id);
            setNome(empresaAtual.nome);
            setCnpj(empresaAtual.cnpj);
            setRazao(empresaAtual.razao || '');
        } else if (modo === 'criacao' && empresas.length === 0) {
            // Não há registros, apenas limpa
            setIdEmpresa('');
            setNome('');
            setCnpj('');
            setRazao('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!nome || !cnpj) {
            setMessage({ type: 'error', text: 'Preencha os campos obrigatórios!' });
            return;
        }

        const dados = { nome, cnpj, razao: razao || null };

        setLoading(true);
        try {
            if (modo === 'edicao' && idEmpresa) {
                const atualizada = await empresaService.atualizar(idEmpresa, dados);
                const empresaMapeada = {
                    id: atualizada.idEmpresa,
                    nome: atualizada.nome,
                    cnpj: atualizada.cnpj,
                    razao: atualizada.razao || ''
                };
                setEmpresas(prev => prev.map(emp => emp.id === idEmpresa ? empresaMapeada : emp));
                // Atualiza o originalData com os novos dados
                setOriginalData(empresaMapeada);
                setMessage({ type: 'success', text: 'Empresa atualizada!' });
            } else if (modo === 'criacao') {
                const nova = await empresaService.criar(dados);
                const novaMapeada = {
                    id: nova.idEmpresa,
                    nome: nova.nome,
                    cnpj: nova.cnpj,
                    razao: nova.razao || ''
                };
                setEmpresas(prev => {
                    const updated = [...prev, novaMapeada];
                    // Seleciona a nova empresa
                    setTimeout(() => {
                        selecionarEmpresa(novaMapeada, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Empresa cadastrada!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!idEmpresa) {
            setMessage({ type: 'error', text: 'Selecione uma empresa!' });
            return;
        }
        if (!window.confirm(`Excluir ${nome}?`)) return;

        setLoading(true);
        try {
            await empresaService.deletar(idEmpresa);
            const filtered = empresas.filter(emp => emp.id !== idEmpresa);
            setEmpresas(filtered);
            if (filtered.length === 0) {
                setIdEmpresa('');
                setNome('');
                setCnpj('');
                setRazao('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setIdEmpresa(current.id);
                setNome(current.nome);
                setCnpj(current.cnpj);
                setRazao(current.razao);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Empresa excluída!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < empresas.length - 1) {
            const next = empresas[currentIndex + 1];
            selecionarEmpresa(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = empresas[currentIndex - 1];
            selecionarEmpresa(prev, currentIndex - 1);
        }
    };

    // Verifica se os campos devem estar desabilitados
    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>🏢</span>
                    <h2>Cadastro de Empresa</h2>
                </div>
                {empresas.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.navigationGroup}>
                        <button
                            className={styles.navButton}
                            onClick={handlePrevious}
                            disabled={currentIndex <= 0 || loading}
                        >
                            ◀
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${empresas.length}` : `0/${empresas.length}`}
                        </span>
                        <button
                            className={styles.navButton}
                            onClick={handleNext}
                            disabled={currentIndex >= empresas.length - 1 || loading}
                        >
                            ▶
                        </button>
                    </div>
                )}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                        <button className={styles.navButton} disabled>◀</button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${empresas.length}` : `0/${empresas.length}`}
                        </span>
                        <button className={styles.navButton} disabled>▶</button>
                    </div>
                )}
            </div>

            {/* Barra de pesquisa só aparece no modo visualização */}
            {modo === 'visualizacao' && (
                <div className={styles.searchSection}>
                    <div className={styles.searchContainer}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Pesquisar por nome, CNPJ ou razão social..."
                            value={searchTerm || ''}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            disabled={loading}
                        />
                        <button
                            className={styles.searchButton}
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            <span>🔍</span> Pesquisar
                        </button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className={styles.resultsList}>
                            {searchResults.map(emp => (
                                <div key={emp.id} className={styles.resultItem} onClick={() => selectEmpresa(emp)}>
                                    <div className={styles.resultItemInfo}>
                                        <span className={styles.resultItemName}>{emp.nome}</span>
                                        <span className={styles.resultItemDoc}>CNPJ: {emp.cnpj}</span>
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
                        <input type="text" value={idEmpresa || ''} disabled placeholder="Automático" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>NOME *</label>
                        <input
                            type="text"
                            value={nome || ''}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o nome"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CNPJ *</label>
                        <input
                            type="text"
                            value={cnpj || ''}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0000-00"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>RAZÃO SOCIAL</label>
                        <input
                            type="text"
                            value={razao || ''}
                            onChange={(e) => setRazao(e.target.value)}
                            placeholder="Digite a razão social (opcional)"
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
                                disabled={loading || !idEmpresa}
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
                                disabled={loading || !idEmpresa}
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

export default EmpresaCadastro;