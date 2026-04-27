import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X, FolderOpen } from 'lucide-react';
import styles from './EmpresaCadastro-novo.module.css';
import { grupoItemService } from '../../services/grupoItemService';
import ConfirmModal from '../Shared/ConfirmModal';
import ModalPesquisaComum from './ModalPesquisaComum';
import { usePesquisa } from '../../hooks/usePesquisa';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

function GrupoItemCadastro() {
    const [idGrupo, setIdGrupo] = useState('');
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');

    const [grupos, setGrupos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao');
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Hook de mensagem temporária (3 segundos)
    const [message, setMessage] = useMensagemTemporaria(3000);

    // Controles de header/pesquisa
    const [showFilters, setShowFilters] = useState(false);
    const [quickSearchId, setQuickSearchId] = useState('');

    // Configuração dos campos de pesquisa
    const camposPesquisaGrupo = [
        { campo: 'nome', label: 'Nome' },
        { campo: 'descricao', label: 'Descrição' },
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
    } = usePesquisa(grupos, camposPesquisaGrupo);

    useEffect(() => {
        carregarGrupos();
    }, []);

    const carregarGrupos = async () => {
        setLoading(true);
        try {
            const data = await grupoItemService.listar();
            const gruposFormatados = data.map(item => ({
                id: item.idGrupo,
                nome: item.nome,
                descricao: item.descricao
            }));
            setGrupos(gruposFormatados);
            if (gruposFormatados.length > 0) {
                selecionarGrupo(gruposFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarGrupo = (grupo, index) => {
        setCurrentIndex(index);
        setIdGrupo(grupo.id);
        setNome(grupo.nome);
        setDescricao(grupo.descricao || '');
        setOriginalData({ ...grupo });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = grupos.filter(grupo =>
            grupo.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum grupo encontrado'
        });
    };

    const selectGrupo = (grupo) => {
        const index = grupos.findIndex(g => g.id === grupo.id);
        selecionarGrupo(grupo, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ id: idGrupo, nome, descricao });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setIdGrupo('');
        setNome('');
        setDescricao('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setIdGrupo(originalData.id);
            setNome(originalData.nome);
            setDescricao(originalData.descricao);
        } else if (modo === 'criacao' && grupos.length > 0 && currentIndex >= 0) {
            const atual = grupos[currentIndex];
            setIdGrupo(atual.id);
            setNome(atual.nome);
            setDescricao(atual.descricao);
        } else if (modo === 'criacao' && grupos.length === 0) {
            setIdGrupo('');
            setNome('');
            setDescricao('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!nome) {
            setMessage({ type: 'error', text: 'Preencha o nome do grupo!' });
            return;
        }

        const dados = { nome, descricao };

        setLoading(true);
        try {
            if (modo === 'edicao' && idGrupo) {
                const atualizado = await grupoItemService.atualizar(idGrupo, dados);
                const grupoMapeado = {
                    id: atualizado.idGrupo,
                    nome: atualizado.nome,
                    descricao: atualizado.descricao
                };
                setGrupos(prev => prev.map(g => g.id === idGrupo ? grupoMapeado : g));
                setOriginalData(grupoMapeado);
                setMessage({ type: 'success', text: 'Grupo atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await grupoItemService.criar(dados);
                const novoMapeado = {
                    id: novo.idGrupo,
                    nome: novo.nome,
                    descricao: novo.descricao
                };
                setGrupos(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarGrupo(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Grupo cadastrado!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!idGrupo) {
            setMessage({ type: 'error', text: 'Selecione um grupo!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await grupoItemService.deletar(idGrupo);
            const filtered = grupos.filter(g => g.id !== idGrupo);
            setGrupos(filtered);
            if (filtered.length === 0) {
                setIdGrupo('');
                setNome('');
                setDescricao('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setIdGrupo(current.id);
                setNome(current.nome);
                setDescricao(current.descricao);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Grupo excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < grupos.length - 1) {
            const next = grupos[currentIndex + 1];
            selecionarGrupo(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = grupos[currentIndex - 1];
            selecionarGrupo(prev, currentIndex - 1);
        }
    };

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (grupos.length > 0 && currentIndex !== 0) {
            selecionarGrupo(grupos[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (grupos.length > 0 && currentIndex !== grupos.length - 1) {
            const lastIndex = grupos.length - 1;
            selecionarGrupo(grupos[lastIndex], lastIndex);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitle}>
                        <span></span>
                        <h2>Cadastro de Grupo de Itens</h2>
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
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && quickSearchId.trim()) {
                                    const id = parseInt(quickSearchId.trim());
                                    if (isNaN(id)) {
                                        setMessage({ type: 'error', text: 'Digite um ID válido!' });
                                    } else {
                                        const grupo = grupos.find(g => g.id === id);
                                        if (grupo) {
                                            const index = grupos.findIndex(g => g.id === id);
                                            selecionarGrupo(grupo, index);
                                            setQuickSearchId('');
                                            setMessage({ type: 'success', text: `Grupo ID ${id} encontrado!` });
                                        } else {
                                            setMessage({ type: 'error', text: `Grupo com ID ${id} não encontrado!` });
                                        }
                                    }
                                }
                            }}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Digite o ID e pressione Enter"
                        />
                        {modo === 'visualizacao' && (
                            <div className={styles.headerActionButtons}>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnEdit}`}
                                    onClick={handleEditar}
                                    disabled={loading || !idGrupo}
                                    title="Editar grupo"
                                >
                                    <Edit2 size={18} /> EDITAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                    onClick={handleNovo}
                                    disabled={loading}
                                    title="Criar novo grupo"
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
                                    disabled={loading || !idGrupo}
                                    title="Excluir grupo"
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
                                    title="Salvar novo grupo"
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

                    {grupos.length > 0 && modo === 'visualizacao' && (
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${grupos.length}` : `0/${grupos.length}`}
                            </span>
                            <button
                                className={styles.navButton}
                                onClick={handleNext}
                                disabled={currentIndex >= grupos.length - 1 || loading}
                                title="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={currentIndex >= grupos.length - 1 || loading}
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${grupos.length}` : `0/${grupos.length}`}
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
                titulo="Pesquisa de Grupos de Itens"
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisaGrupo}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                resultados={resultados}
                mostrarResultados={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(grupo) => {
                    const index = grupos.findIndex(g => g.id === grupo.id);
                    selecionarGrupo(grupo, index);
                    handleSelecionarResultado(grupo);
                    setShowFilters(false);
                }}
                colunas={[
                    { campo: 'id', label: 'Código' },
                    { campo: 'nome', label: 'Nome' },
                    { campo: 'descricao', label: 'Descrição' }
                ]}
                multiFiltro={true}
                dados={grupos}
            />

            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>CÓDIGO</label>
                        <input type="text" value={idGrupo || ''} disabled placeholder="Automático" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>GRUPO *</label>
                        <input
                            type="text"
                            value={nome || ''}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o nome do grupo"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>DESCRIÇÃO</label>
                        <input
                            type="text"
                            value={descricao || ''}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Digite a descrição do grupo"
                            disabled={camposDesabilitados}
                        />
                    </div>
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
                message="Tem certeza que deseja excluir este grupo de itens? Esta ação não pode ser desfeita."
                itemName={nome}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default GrupoItemCadastro;
