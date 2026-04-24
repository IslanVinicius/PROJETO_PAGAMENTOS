import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X, Package, Percent } from 'lucide-react';
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
    const [precoMedio, setPrecoMedio] = useState('');
    const [tipoUnitario, setTipoUnitario] = useState('UNIDADE');
    const [idGrupo, setIdGrupo] = useState('');
    const [grupos, setGrupos] = useState([]);
    const [descontos, setDescontos] = useState([]); // Lista de descontos progressivos

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

    // Opções de tipo unitário
    const tiposUnitarios = [
        { value: 'UNIDADE', label: 'Unidade (un)' },
        { value: 'METRO_CUBICO', label: 'Metro Cúbico (m³)' },
        { value: 'METRO_QUADRADO', label: 'Metro Quadrado (m²)' },
        { value: 'METRO', label: 'Metro (m)' },
        { value: 'CENTIMETRO', label: 'Centímetro (cm)' },
        { value: 'QUILOGRAMA', label: 'Quilograma (kg)' },
        { value: 'GRAMA', label: 'Grama (g)' },
        { value: 'LITRO', label: 'Litro (L)' },
        { value: 'MILILITRO', label: 'Mililitro (ml)' },
        { value: 'PACOTE', label: 'Pacote (pct)' },
        { value: 'CAIXA', label: 'Caixa (cx)' },
        { value: 'GALAO', label: 'Galão (gal)' },
        { value: 'TAMBOR', label: 'Tambor (tmb)' },
        { value: 'ROLO', label: 'Rolo (rl)' },
        { value: 'PAR', label: 'Par (par)' }
    ];

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
                precoMedio: item.precoMedio,
                tipoUnitario: item.tipoUnitario,
                idGrupo: item.idGrupo,
                descontos: item.descontos || []
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
        setPrecoMedio(item.precoMedio || '');
        setTipoUnitario(item.tipoUnitario || 'UNIDADE');
        setIdGrupo(item.idGrupo);
        setDescontos(item.descontos || []);
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
        setOriginalData({ id: idItem, nome, descricao, valorUnitario, precoMedio, tipoUnitario, idGrupo, descontos });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setIdItem('');
        setNome('');
        setDescricao('');
        setValorUnitario('');
        setPrecoMedio('');
        setTipoUnitario('UNIDADE');
        setIdGrupo('');
        setDescontos([]);
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setIdItem(originalData.id);
            setNome(originalData.nome);
            setDescricao(originalData.descricao);
            setValorUnitario(originalData.valorUnitario);
            setPrecoMedio(originalData.precoMedio);
            setTipoUnitario(originalData.tipoUnitario);
            setIdGrupo(originalData.idGrupo);
            setDescontos(originalData.descontos || []);
        } else if (modo === 'criacao' && itens.length > 0 && currentIndex >= 0) {
            const atual = itens[currentIndex];
            setIdItem(atual.id);
            setNome(atual.nome);
            setDescricao(atual.descricao);
            setValorUnitario(atual.valorUnitario);
            setPrecoMedio(atual.precoMedio);
            setTipoUnitario(atual.tipoUnitario);
            setIdGrupo(atual.idGrupo);
            setDescontos(atual.descontos || []);
        } else if (modo === 'criacao' && itens.length === 0) {
            setIdItem('');
            setNome('');
            setDescricao('');
            setValorUnitario('');
            setPrecoMedio('');
            setTipoUnitario('UNIDADE');
            setIdGrupo('');
            setDescontos([]);
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
            precoMedio: precoMedio ? parseFloat(precoMedio) : null,
            tipoUnitario: tipoUnitario || 'UNIDADE',
            idGrupo: parseInt(idGrupo),
            descontos: descontos.map(d => ({
                quantidadeMinima: d.quantidadeMinima,
                percentualDesconto: d.percentualDesconto,
                valorFinal: d.valorFinal,
                descricao: d.descricao
            }))
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
                    precoMedio: atualizado.precoMedio,
                    tipoUnitario: atualizado.tipoUnitario,
                    idGrupo: atualizado.idGrupo,
                    descontos: atualizado.descontos || []
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
                    precoMedio: novo.precoMedio,
                    tipoUnitario: novo.tipoUnitario,
                    idGrupo: novo.idGrupo,
                    descontos: novo.descontos || []
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

    // Funções para gerenciar descontos progressivos
    const handleAddDesconto = () => {
        setDescontos([...descontos, { quantidadeMinima: 0, percentualDesconto: 0, valorFinal: null, descricao: '' }]);
    };

    const handleRemoveDesconto = (index) => {
        setDescontos(descontos.filter((_, i) => i !== index));
    };

    const handleUpdateDesconto = (index, field, value) => {
        const novosDescontos = [...descontos];
        novosDescontos[index] = { ...novosDescontos[index], [field]: value };
        
        // Se atualizou valorFinal, recalcula percentual
        if (field === 'valorFinal' && valorUnitario) {
            const valorFinalNum = parseFloat(value) || 0;
            const valorUnitarioNum = parseFloat(valorUnitario) || 0;
            if (valorUnitarioNum > 0) {
                const percentual = ((valorUnitarioNum - valorFinalNum) / valorUnitarioNum) * 100;
                novosDescontos[index].percentualDesconto = parseFloat(percentual.toFixed(2));
            }
        }
        
        // Se atualizou percentual, recalcula valorFinal
        if (field === 'percentualDesconto' && valorUnitario) {
            const percentualNum = parseFloat(value) || 0;
            const valorUnitarioNum = parseFloat(valorUnitario) || 0;
            const valorFinal = valorUnitarioNum * (1 - (percentualNum / 100));
            novosDescontos[index].valorFinal = parseFloat(valorFinal.toFixed(2));
        }
        
        setDescontos(novosDescontos);
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
                        <label>PREÇO MÉDIO</label>
                        <input
                            type="number"
                            step="0.01"
                            value={precoMedio || ''}
                            onChange={(e) => setPrecoMedio(e.target.value)}
                            placeholder="0,00"
                            disabled={camposDesabilitados}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>TIPO UNITÁRIO</label>
                        <select
                            value={tipoUnitario || 'UNIDADE'}
                            onChange={(e) => setTipoUnitario(e.target.value)}
                            disabled={camposDesabilitados}
                            className={styles.select}
                        >
                            {tiposUnitarios.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </option>
                            ))}
                        </select>
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

                {/* Seção de Descontos Progressivos */}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.formSection} style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                                <Percent size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                Descontos Progressivos por Quantidade
                            </h3>
                            <button
                                type="button"
                                onClick={handleAddDesconto}
                                className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                style={{ padding: '8px 12px', fontSize: '12px' }}
                            >
                                <Plus size={14} /> Adicionar Condição
                            </button>
                        </div>

                        {descontos.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Qtd. Mínima</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Desconto (%)</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Valor Final (R$)</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Total (R$)</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Descrição</th>
                                            <th style={{ padding: '10px', textAlign: 'center', width: '80px' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {descontos.map((desconto, index) => {
                                            const valorFinalNum = parseFloat(desconto.valorFinal) || 0;
                                            const qtdMinima = parseInt(desconto.quantidadeMinima) || 0;
                                            const total = valorFinalNum * qtdMinima;
                                            
                                            return (
                                                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={desconto.quantidadeMinima}
                                                            onChange={(e) => handleUpdateDesconto(index, 'quantidadeMinima', parseInt(e.target.value) || 0)}
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#ffffff', color: '#000000' }}
                                                            disabled={camposDesabilitados}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={desconto.percentualDesconto || ''}
                                                            onChange={(e) => handleUpdateDesconto(index, 'percentualDesconto', e.target.value)}
                                                            placeholder="%"
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#ffffff', color: '#000000' }}
                                                            disabled={camposDesabilitados}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={desconto.valorFinal || ''}
                                                            onChange={(e) => handleUpdateDesconto(index, 'valorFinal', e.target.value)}
                                                            placeholder="R$ 0,00"
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #4CAF50', borderRadius: '4px', backgroundColor: '#ffffff', color: '#000000' }}
                                                            disabled={camposDesabilitados}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="text"
                                                            value={`R$ ${total.toFixed(2).replace('.', ',')}`}
                                                            readOnly
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f0f0f0', color: '#333', fontWeight: 'bold', cursor: 'not-allowed' }}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px' }}>
                                                        <input
                                                            type="text"
                                                            value={desconto.descricao || ''}
                                                            onChange={(e) => handleUpdateDesconto(index, 'descricao', e.target.value)}
                                                            placeholder="Ex: 5-10 unidades"
                                                            style={{ width: '100%', padding: '6px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#ffffff', color: '#000000' }}
                                                            disabled={camposDesabilitados}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '8px', textAlign: 'center' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveDesconto(index)}
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545' }}
                                                            title="Remover condição"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', fontSize: '12px', color: '#1976d2' }}>
                                    💡 <strong>Dica:</strong> Preencha o <strong>Desconto (%)</strong> ou o <strong>Valor Final (R$)</strong> - o outro campo será calculado automaticamente! O campo "Total" é calculado automaticamente (Qtd. Mínima × Valor Final).
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '4px', color: '#666' }}>
                                Nenhum desconto progressivo cadastrado. Clique em "Adicionar Condição" para criar.
                            </div>
                        )}
                    </div>
                )}


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
