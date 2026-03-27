import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import styles from './EmpresaCadastro-novo.module.css';
import { itemService } from '../../services/itemService';
import { grupoItemService } from '../../services/grupoItemService';
import ConfirmModal from '../Shared/ConfirmModal';
import ModalPesquisaComum from './ModalPesquisaComum';
import { usePesquisa } from '../../hooks/usePesquisa';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

function ItemCadastro() {
    const [idItem, setIdItem] = useState('');
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valorUnitario, setValorUnitario] = useState('');
    const [idGrupo, setIdGrupo] = useState('');
    const [grupos, setGrupos] = useState([]);

    const [itens, setItens] = useState([]);
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
    const camposPesquisaItem = [
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
    } = usePesquisa(itens, camposPesquisaItem);

    useEffect(() => {
        carregarItens();
        carregarGrupos();
    }, []);

    const carregarGrupos = async () => {
        try {
            const data = await grupoItemService.listar();
            setGrupos(data);
        } catch (error) {
            console.error('Erro ao carregar grupos:', error);
        }
    };

    const carregarItens = async () => {
        setLoading(true);
        try {
            const data = await itemService.listar();
            const itensFormatados = data.map(item => ({
                id: item.idItem,
                nome: item.nome,
                descricao: item.descricao,
                valorUnitario: item.valorUnitario,
                idGrupo: item.idGrupo
            }));
            setItens(itensFormatados);
            if (itensFormatados.length > 0) {
                selecionarItem(itensFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarItem = (item, index) => {
        setCurrentIndex(index);
        setIdItem(item.id);
        setNome(item.nome);
        setDescricao(item.descricao || '');
        setValorUnitario(item.valorUnitario || '');
        setIdGrupo(item.idGrupo);
        setOriginalData({ ...item });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = itens.filter(item =>
            item.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum item encontrado'
        });
    };

    const selectItem = (item) => {
        const index = itens.findIndex(i => i.id === item.id);
        selecionarItem(item, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ id: idItem, nome, descricao, valorUnitario, idGrupo });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setIdItem('');
        setNome('');
        setDescricao('');
        setValorUnitario('');
        setIdGrupo('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setIdItem(originalData.id);
            setNome(originalData.nome);
            setDescricao(originalData.descricao);
            setValorUnitario(originalData.valorUnitario);
            setIdGrupo(originalData.idGrupo);
        } else if (modo === 'criacao' && itens.length > 0 && currentIndex >= 0) {
            const atual = itens[currentIndex];
            setIdItem(atual.id);
            setNome(atual.nome);
            setDescricao(atual.descricao);
            setValorUnitario(atual.valorUnitario);
            setIdGrupo(atual.idGrupo);
        } else if (modo === 'criacao' && itens.length === 0) {
            setIdItem('');
            setNome('');
            setDescricao('');
            setValorUnitario('');
            setIdGrupo('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!nome) {
            setMessage({ type: 'error', text: 'Preencha o nome do item!' });
            return;
        }
        if (!idGrupo) {
            setMessage({ type: 'error', text: 'Selecione um grupo!' });
            return;
        }

        const dados = {
            nome,
            descricao,
            valorUnitario: valorUnitario ? parseFloat(valorUnitario) : null,
            idGrupo: parseInt(idGrupo)
        };

        setLoading(true);
        try {
            if (modo === 'edicao' && idItem) {
                const atualizado = await itemService.atualizar(idItem, dados);
                const itemMapeado = {
                    id: atualizado.idItem,
                    nome: atualizado.nome,
                    descricao: atualizado.descricao,
                    valorUnitario: atualizado.valorUnitario,
                    idGrupo: atualizado.idGrupo
                };
                setItens(prev => prev.map(i => i.id === idItem ? itemMapeado : i));
                setOriginalData(itemMapeado);
                setMessage({ type: 'success', text: 'Item atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await itemService.criar(dados);
                const novoMapeado = {
                    id: novo.idItem,
                    nome: novo.nome,
                    descricao: novo.descricao,
                    valorUnitario: novo.valorUnitario,
                    idGrupo: novo.idGrupo
                };
                setItens(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarItem(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Item cadastrado!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!idItem) {
            setMessage({ type: 'error', text: 'Selecione um item!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await itemService.deletar(idItem);
            const filtered = itens.filter(i => i.id !== idItem);
            setItens(filtered);
            if (filtered.length === 0) {
                setIdItem('');
                setNome('');
                setDescricao('');
                setValorUnitario('');
                setIdGrupo('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setIdItem(current.id);
                setNome(current.nome);
                setDescricao(current.descricao);
                setValorUnitario(current.valorUnitario);
                setIdGrupo(current.idGrupo);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Item excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < itens.length - 1) {
            const next = itens[currentIndex + 1];
            selecionarItem(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = itens[currentIndex - 1];
            selecionarItem(prev, currentIndex - 1);
        }
    };

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (itens.length > 0 && currentIndex !== 0) {
            selecionarItem(itens[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (itens.length > 0 && currentIndex !== itens.length - 1) {
            const lastIndex = itens.length - 1;
            selecionarItem(itens[lastIndex], lastIndex);
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
            const item = itens.find(i => i.id === id);
            if (item) {
                const index = itens.findIndex(i => i.id === id);
                selecionarItem(item, index);
                setQuickSearchId('');
                setMessage({ type: 'success', text: `Item ID ${id} encontrado!` });
            } else {
                setMessage({ type: 'error', text: `Item com ID ${id} não encontrado!` });
            }
        }
    };

    const getNomeGrupo = (id) => {
        const grupo = grupos.find(g => g.idGrupo === id);
        return grupo ? grupo.nome : 'Grupo não encontrado';
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitle}>
                        <span></span>
                        <h2>Cadastro de Itens</h2>
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
                                    disabled={loading || !idItem}
                                    title="Editar item"
                                >
                                    <Edit2 size={18} /> EDITAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                    onClick={handleNovo}
                                    disabled={loading}
                                    title="Criar novo item"
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
                                    disabled={loading || !idItem}
                                    title="Excluir item"
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
                                    title="Salvar novo item"
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

                    {itens.length > 0 && modo === 'visualizacao' && (
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${itens.length}` : `0/${itens.length}`}
                            </span>
                            <button
                                className={styles.navButton}
                                onClick={handleNext}
                                disabled={currentIndex >= itens.length - 1 || loading}
                                title="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={currentIndex >= itens.length - 1 || loading}
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${itens.length}` : `0/${itens.length}`}
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
                titulo="Pesquisa de Itens"
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisaItem}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                resultados={resultados}
                mostrarResultados={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(item) => {
                    const index = itens.findIndex(i => i.id === item.id);
                    selecionarItem(item, index);
                    handleSelecionarResultado(item);
                    setShowFilters(false);
                }}
                colunas={[
                    { campo: 'id', label: 'Código' },
                    { campo: 'nome', label: 'Nome' },
                    { campo: 'descricao', label: 'Descrição' },
                    { campo: 'valorUnitario', label: 'Valor Unitário' }
                ]}
                multiFiltro={true}
                dados={itens}
            />

            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>CÓDIGO</label>
                        <input type="text" value={idItem || ''} disabled placeholder="Automático" />
                    </div>
                    <div className={styles.formGroup}>
                        <label>NOME *</label>
                        <input
                            type="text"
                            value={nome || ''}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite o nome do item"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>DESCRIÇÃO</label>
                        <input
                            type="text"
                            value={descricao || ''}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Digite a descrição do item"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>VALOR UNITÁRIO</label>
                        <input
                            type="number"
                            step="0.01"
                            value={valorUnitario || ''}
                            onChange={(e) => setValorUnitario(e.target.value)}
                            placeholder="0,00"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>GRUPO *</label>
                        <select
                            value={idGrupo || ''}
                            onChange={(e) => setIdGrupo(e.target.value)}
                            disabled={camposDesabilitados}
                            className={styles.select}
                        >
                            <option value="">Selecione um grupo</option>
                            {grupos.map(grupo => (
                                <option key={grupo.idGrupo} value={grupo.idGrupo}>
                                    {grupo.nome}
                                </option>
                            ))}
                        </select>
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
                message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
                itemName={nome}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default ItemCadastro;
