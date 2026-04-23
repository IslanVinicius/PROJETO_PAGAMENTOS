import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import styles from './EmpresaCadastro-novo.module.css';
import { prestadorService } from '../../services/prestadorService';
import ConfirmModal from '../Shared/ConfirmModal';
import { BarraPesquisa, ResultadosPesquisa } from '../common';
import ModalPesquisaComum from './ModalPesquisaComum';
import { usePesquisa } from '../../hooks/usePesquisa';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

function PrestadorCadastro() {
    const [codPrestador, setCodPrestador] = useState('');
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');

    const [prestadores, setPrestadores] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Hook de mensagem temporária (3 segundos)
    const [message, setMessage] = useMensagemTemporaria(3000);

    // Controles de header/pesquisa
    const [showFilters, setShowFilters] = useState(false);
    const [quickSearchId, setQuickSearchId] = useState('');

    // Configuração dos campos de pesquisa
    const camposPesquisaPrestador = [
        { campo: 'nome', label: 'Nome' },
        { campo: 'cpf', label: 'CPF' },
        { campo: 'id', label: 'ID' }
    ];

    // Hook de pesquisa
    const {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado
    } = usePesquisa(prestadores, camposPesquisaPrestador);

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

    const handleDeleteClick = () => {
        if (!codPrestador) {
            setMessage({ type: 'error', text: 'Selecione um prestador!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
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

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (prestadores.length > 0 && currentIndex !== 0) {
            selecionarPrestador(prestadores[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (prestadores.length > 0 && currentIndex !== prestadores.length - 1) {
            const lastIndex = prestadores.length - 1;
            selecionarPrestador(prestadores[lastIndex], lastIndex);
        }
    };

    // Busca rápida por ID no header
    const handleQuickSearchById = (e) => {
        if (e.key === 'Enter' && quickSearchId.trim()) {
            const id = parseInt(quickSearchId.trim());
            if (isNaN(id)) {
                setMessage({ type: 'error', text: 'Digite um ID válido!' });
                return;
            }
            const prestador = prestadores.find(p => p.id === id);
            if (prestador) {
                const index = prestadores.findIndex(p => p.id === id);
                selecionarPrestador(prestador, index);
                setQuickSearchId('');
                setMessage({ type: 'success', text: `Prestador ID ${id} encontrado!` });
            } else {
                setMessage({ type: 'error', text: `Prestador com ID ${id} não encontrado!` });
            }
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitle}>
                        <h2>Cadastro de Prestador</h2>
                    </div>
                </div>

                <div className={styles.headerControls}>
                    <div className={styles.quickSearchGroup}>
                        <button
                            className={styles.searchIconButton}
                            onClick={() => setShowFilters(true)}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Abrir filtros de pesquisa"
                        >
                            <Search size={20} />
                        </button>
                        <input
                            type="text"
                            className={styles.quickSearchInput}
                            placeholder="ID..."
                            value={quickSearchId}
                            onChange={(e) => setQuickSearchId(e.target.value)}
                            onKeyPress={handleQuickSearchById}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Digite o ID e pressione Enter"
                        />
                        {modo === 'visualizacao' && (
                            <div className={styles.headerActionButtons}>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnEdit}`}
                                    onClick={handleEditar}
                                    disabled={loading || !codPrestador}
                                    title="Editar prestador"
                                >
                                    <Edit2 size={18} /> EDITAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                    onClick={handleNovo}
                                    disabled={loading}
                                    title="Criar novo prestador"
                                >
                                    <Plus size={18} /> NOVO
                                </button>
                            </div>
                        )}
                        {modo === 'edicao' && (
                            <div className={styles.headerActionButtons}>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnSave}`}
                                    onClick={handleSave}
                                    disabled={loading}
                                    title="Salvar alterações"
                                >
                                    <Save size={18} /> SALVAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnDelete}`}
                                    onClick={handleDeleteClick}
                                    disabled={loading || !codPrestador}
                                    title="Excluir prestador"
                                >
                                    <Trash2 size={18} /> EXCLUIR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnCancel}`}
                                    onClick={handleCancelar}
                                    disabled={loading}
                                    title="Cancelar edição"
                                >
                                    <X size={18} /> CANCELAR
                                </button>
                            </div>
                        )}
                        {modo === 'criacao' && (
                            <div className={styles.headerActionButtons}>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnSave}`}
                                    onClick={handleSave}
                                    disabled={loading}
                                    title="Salvar novo prestador"
                                >
                                    <Save size={18} /> SALVAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnCancel}`}
                                    onClick={handleCancelar}
                                    disabled={loading}
                                    title="Cancelar criação"
                                >
                                    <X size={18} /> CANCELAR
                                </button>
                            </div>
                        )}
                    </div>

                    {prestadores.length > 0 && modo === 'visualizacao' && (
                        <div className={styles.navigationGroup}>
                            <button
                                className={styles.navButton}
                                onClick={handleFirst}
                                disabled={currentIndex <= 0 || loading}
                                title="Primeiro registro"
                            >
                                <ChevronFirst size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handlePrevious}
                                disabled={currentIndex <= 0 || loading}
                                title="Anterior"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className={styles.positionIndicator}>
                                {currentIndex >= 0 ? `${currentIndex + 1}/${prestadores.length}` : `0/${prestadores.length}`}
                            </span>
                            <button
                                className={styles.navButton}
                                onClick={handleNext}
                                disabled={currentIndex >= prestadores.length - 1 || loading}
                                title="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={currentIndex >= prestadores.length - 1 || loading}
                                title="Último registro"
                            >
                                <ChevronLast size={20} />
                            </button>
                        </div>
                    )}
                    {(modo === 'edicao' || modo === 'criacao') && (
                        <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                            <button className={styles.navButton} disabled title="Primeiro registro">
                                <ChevronFirst size={20} />
                            </button>
                            <button className={styles.navButton} disabled title="Anterior">
                                <ChevronLeft size={20} />
                            </button>
                            <span className={styles.positionIndicator}>
                                {currentIndex >= 0 ? `${currentIndex + 1}/${prestadores.length}` : `0/${prestadores.length}`}
                            </span>
                            <button className={styles.navButton} disabled title="Próximo">
                                <ChevronRight size={20} />
                            </button>
                            <button className={styles.navButton} disabled title="Último registro">
                                <ChevronLast size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ModalPesquisaComum
                isOpen={showFilters && modo === 'visualizacao'}
                onClose={() => setShowFilters(false)}
                titulo="Pesquisa de Prestadores"
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisaPrestador}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                resultados={resultados}
                mostrarResultados={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(prestador) => {
                    const index = prestadores.findIndex(p => p.id === prestador.id);
                    selecionarPrestador(prestador, index);
                    handleSelecionarResultado(prestador);
                    setShowFilters(false);
                }}
                colunas={[
                    { campo: 'id', label: 'Código' },
                    { campo: 'nome', label: 'Nome' },
                    { campo: 'cpf', label: 'CPF' }
                ]}
                multiFiltro={true}
                dados={prestadores}
            />

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
                        <label>CPF/CNPJ *</label>
                        <input
                            type="text"
                            value={cpf || ''}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
                            disabled={camposDesabilitados}
                        />
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este prestador? Esta ação não pode ser desfeita."
                itemName={nome}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default PrestadorCadastro;