import React, { useState, useEffect, useRef } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronFirst,
    ChevronLast,
    Search,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    MapPin,
    Loader
} from 'lucide-react';
import styles from './EnderecoCadastro-novo.module.css';
import { enderecoService } from '../../services/enderecoService';
import ConfirmModal from '../Shared/ConfirmModal';
import ModalPesquisaFiltroEmpresa from './ModalPesquisaFiltroEmpresa';
import ModalPesquisaFiltroEndereco from './ModalPesquisaFiltroEndereco';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';
import { useAuth } from '../../contexts/AuthContext';

function EnderecoCadastro() {
    const { user } = useAuth();

    // Verifica permissão - apenas ADMIN e ESCRITORIO podem acessar
    // Aceita tanto 'ADMIN' quanto 'ROLE_ADMIN' (com ou sem prefixo)
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';
    const isEscritorio = user?.role === 'ESCRITORIO' || user?.role === 'ROLE_ESCRITORIO';
    
    if (!user || (!isAdmin && !isEscritorio)) {
        return (
            <div className={styles.container}>
                <div className={styles.accessDenied}>
                    <h2>Acesso Negado</h2>
                    <p>Você não tem permissão para acessar esta página.</p>
                </div>
            </div>
        );
    }

    // Estados dos campos
    const [idEndereco, setIdEndereco] = useState('');
    const [cep, setCep] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [idEmpresa, setIdEmpresa] = useState('');
    const [nomeEmpresa, setNomeEmpresa] = useState('');

    // Estados de controle
    const [enderecos, setEnderecos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'

    // Para armazenar dados originais durante edição (para cancelar)
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAddressSearchModal, setShowAddressSearchModal] = useState(false);
    const [showEmpresaSelectModal, setShowEmpresaSelectModal] = useState(false);
    const [quickSearchId, setQuickSearchId] = useState('');

    const [cepLoading, setCepLoading] = useState(false);

    // Hook de mensagem temporária (3 segundos)
    const [message, setMessage] = useMensagemTemporaria(3000);

    // Ref para evitar chamadas duplicadas ao mesmo CEP
    const lastCepSearched = useRef('');

    useEffect(() => {
        carregarEnderecos();
    }, []);

    const carregarEnderecos = async () => {
        setLoading(true);
        try {
            const data = await enderecoService.listar();
            const enderecosFormatados = data.map(item => ({
                id: item.idEndereco,
                cep: item.cep,
                logradouro: item.logradouro,
                numero: item.numero,
                complemento: item.complemento || '',
                bairro: item.bairro,
                cidade: item.cidade,
                estado: item.estado,
                idEmpresa: item.idEmpresa,
                nomeEmpresa: item.nomeEmpresa || ''
            }));
            setEnderecos(enderecosFormatados);
            if (enderecosFormatados.length > 0) {
                selecionarEndereco(enderecosFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarEndereco = (endereco, index) => {
        setCurrentIndex(index);
        setIdEndereco(endereco.id);
        setCep(endereco.cep);
        setLogradouro(endereco.logradouro);
        setNumero(endereco.numero);
        setComplemento(endereco.complemento);
        setBairro(endereco.bairro);
        setCidade(endereco.cidade);
        setEstado(endereco.estado);
        setIdEmpresa(endereco.idEmpresa);
        setNomeEmpresa(endereco.nomeEmpresa || '');
        setOriginalData({ ...endereco });
        setModo('visualizacao');
    };

    const handleEditar = () => {
        setOriginalData({
            id: idEndereco,
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
            idEmpresa,
            nomeEmpresa
        });
        lastCepSearched.current = cep.replace(/\D/g, '');
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setIdEndereco('');
        setCep('');
        setLogradouro('');
        setNumero('');
        setComplemento('');
        setBairro('');
        setCidade('');
        setEstado('');
        setIdEmpresa('');
        setNomeEmpresa('');
        lastCepSearched.current = '';
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setIdEndereco(originalData.id);
            setCep(originalData.cep);
            setLogradouro(originalData.logradouro);
            setNumero(originalData.numero);
            setComplemento(originalData.complemento);
            setBairro(originalData.bairro);
            setCidade(originalData.cidade);
            setEstado(originalData.estado);
            setIdEmpresa(originalData.idEmpresa);
            setNomeEmpresa(originalData.nomeEmpresa || '');
        } else if (modo === 'criacao' && enderecos.length > 0 && currentIndex >= 0) {
            const enderecoAtual = enderecos[currentIndex];
            setIdEndereco(enderecoAtual.id);
            setCep(enderecoAtual.cep);
            setLogradouro(enderecoAtual.logradouro);
            setNumero(enderecoAtual.numero);
            setComplemento(enderecoAtual.complemento);
            setBairro(enderecoAtual.bairro);
            setCidade(enderecoAtual.cidade);
            setEstado(enderecoAtual.estado);
            setIdEmpresa(enderecoAtual.idEmpresa);
            setNomeEmpresa(enderecoAtual.nomeEmpresa || '');
        } else if (modo === 'criacao' && enderecos.length === 0) {
            setIdEndereco('');
            setCep('');
            setLogradouro('');
            setNumero('');
            setComplemento('');
            setBairro('');
            setCidade('');
            setEstado('');
            setIdEmpresa('');
            setNomeEmpresa('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!cep || !logradouro || !numero || !bairro || !cidade || !estado || !idEmpresa) {
            setMessage({ type: 'error', text: 'Preencha os campos obrigatórios!' });
            return;
        }

        if (modo === 'criacao') {
            const empresaJaPossuiEndereco = enderecos.some(
                end => String(end.idEmpresa) === String(idEmpresa)
            );
            if (empresaJaPossuiEndereco) {
                setMessage({ type: 'error', text: 'Esta empresa já possui um endereço cadastrado!' });
                return;
            }
        }

        const dados = {
            cep,
            logradouro,
            numero,
            complemento: complemento || null,
            bairro,
            cidade,
            estado,
            idEmpresa
        };

        setLoading(true);
        try {
            if (modo === 'edicao' && idEndereco) {
                const atualizado = await enderecoService.atualizar(idEndereco, dados);
                const enderecoMapeado = {
                    id: atualizado.idEndereco,
                    cep: atualizado.cep,
                    logradouro: atualizado.logradouro,
                    numero: atualizado.numero,
                    complemento: atualizado.complemento || '',
                    bairro: atualizado.bairro,
                    cidade: atualizado.cidade,
                    estado: atualizado.estado,
                    idEmpresa: atualizado.idEmpresa,
                    nomeEmpresa: atualizado.nomeEmpresa || nomeEmpresa
                };
                setEnderecos(prev => prev.map(end => end.id === idEndereco ? enderecoMapeado : end));
                setOriginalData(enderecoMapeado);
                setMessage({ type: 'success', text: 'Endereço atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await enderecoService.criar(dados);
                const novoMapeado = {
                    id: novo.idEndereco,
                    cep: novo.cep,
                    logradouro: novo.logradouro,
                    numero: novo.numero,
                    complemento: novo.complemento || '',
                    bairro: novo.bairro,
                    cidade: novo.cidade,
                    estado: novo.estado,
                    idEmpresa: novo.idEmpresa,
                    nomeEmpresa: novo.nomeEmpresa || nomeEmpresa
                };
                setEnderecos(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarEndereco(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Endereço cadastrado!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!idEndereco) {
            setMessage({ type: 'error', text: 'Selecione um endereço!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await enderecoService.deletar(idEndereco);
            const filtered = enderecos.filter(end => end.id !== idEndereco);
            setEnderecos(filtered);
            if (filtered.length === 0) {
                setIdEndereco('');
                setCep('');
                setLogradouro('');
                setNumero('');
                setComplemento('');
                setBairro('');
                setCidade('');
                setEstado('');
                setIdEmpresa('');
                setNomeEmpresa('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setIdEndereco(current.id);
                setCep(current.cep);
                setLogradouro(current.logradouro);
                setNumero(current.numero);
                setComplemento(current.complemento);
                setBairro(current.bairro);
                setCidade(current.cidade);
                setEstado(current.estado);
                setIdEmpresa(current.idEmpresa);
                setNomeEmpresa(current.nomeEmpresa || '');
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Endereço excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < enderecos.length - 1) {
            const next = enderecos[currentIndex + 1];
            selecionarEndereco(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = enderecos[currentIndex - 1];
            selecionarEndereco(prev, currentIndex - 1);
        }
    };

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (enderecos.length > 0 && currentIndex !== 0) {
            selecionarEndereco(enderecos[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (enderecos.length > 0 && currentIndex !== enderecos.length - 1) {
            const lastIndex = enderecos.length - 1;
            selecionarEndereco(enderecos[lastIndex], lastIndex);
        }
    };

    const handleQuickSearchById = (e) => {
        if (e.key === 'Enter' && quickSearchId.trim()) {
            const id = parseInt(quickSearchId.trim());
            if (isNaN(id)) {
                setMessage({ type: 'error', text: 'Digite um ID válido!' });
                return;
            }

            const endereco = enderecos.find(end => end.id === id);
            if (endereco) {
                const index = enderecos.findIndex(e => e.id === id);
                selecionarEndereco(endereco, index);
                setQuickSearchId('');
                setMessage({ type: 'success', text: `Endereço ID ${id} encontrado!` });
            } else {
                setMessage({ type: 'error', text: `Endereço com ID ${id} não encontrado!` });
            }
        }
    };

    const handleOpenAddressSearchModal = () => {
        if (modo === 'visualizacao') {
            setShowAddressSearchModal(true);
        }
    };

    const handleSelectFromAddressModal = (endereco) => {
        const index = enderecos.findIndex(e => e.id === endereco.id);
        selecionarEndereco(endereco, index);
        setShowAddressSearchModal(false);
    };

    const buscarCepAutofill = async (cepDigitos) => {
        if (lastCepSearched.current === cepDigitos) return;
        lastCepSearched.current = cepDigitos;

        setCepLoading(true);
        try {
            const data = await enderecoService.buscarCep(cepDigitos);
            setLogradouro(data.logradouro || '');
            setBairro(data.bairro || '');
            setCidade(data.cidade || '');
            setEstado(data.estado || '');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'CEP não encontrado.' });
        } finally {
            setCepLoading(false);
        }
    };

    const handleCepChange = (e) => {
        const value = e.target.value;
        setCep(value);
        const digits = value.replace(/\D/g, '');
        if (digits.length === 8) {
            buscarCepAutofill(digits);
        }
    };

    const handleCepBlur = () => {
        const digits = cep.replace(/\D/g, '');
        if (digits.length === 8) {
            buscarCepAutofill(digits);
        }
    };

    const handleSelecionarEmpresa = (empresa) => {
        setIdEmpresa(empresa.id);
        setNomeEmpresa(empresa.nome);
    };

    // Verifica se os campos devem estar desabilitados
    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.headerTitle}>
                        <MapPin size={24} />
                        <h2>Cadastro de Endereço</h2>
                    </div>
                </div>

                <div className={styles.headerControls}>
                    <div className={styles.quickSearchGroup}>
                        <button
                            className={styles.searchIconButton}
                            onClick={handleOpenAddressSearchModal}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Abrir pesquisa avançada"
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
                                    disabled={loading || !idEndereco}
                                    title="Editar endereço"
                                >
                                    <Edit2 size={18} /> EDITAR
                                </button>
                                <button
                                    className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                    onClick={handleNovo}
                                    disabled={loading}
                                    title="Criar novo endereço"
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
                                    disabled={loading || !idEndereco}
                                    title="Excluir endereço"
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
                                    title="Salvar novo endereço"
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

                    {/* Botões de Navegação */}
                    {enderecos.length > 0 && modo === 'visualizacao' && (
                        <div className={styles.navigationGroup}>
                            <button
                                className={styles.navButton}
                                onClick={handleFirst}
                                disabled={loading}
                                title="Primeiro"
                            >
                                <ChevronFirst size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handlePrevious}
                                disabled={loading}
                                title="Anterior"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className={styles.currentIndex}>
                                {currentIndex + 1} / {enderecos.length}
                            </span>
                            <button
                                className={styles.navButton}
                                onClick={handleNext}
                                disabled={loading}
                                title="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={loading}
                                title="Último"
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
                            <span className={styles.currentIndex}>
                                {currentIndex >= 0 ? `${currentIndex + 1}/${enderecos.length}` : `0/${enderecos.length}`}
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

            {/* Mensagem de feedback */}
            {message.text && (
                <div className={`${styles.messageContainer} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            {/* Campos do Formulário */}
            <div className={styles.formContainer}>
                {/* Linha 1: Empresa */}
                <div className={styles.formRow}>
                    <div className={styles.fieldGroupLarge}>
                        <label htmlFor="empresa">Empresa *</label>
                        <div className={styles.inputWithButton}>
                            <input
                                id="empresa"
                                type="text"
                                className={styles.inputField}
                                value={nomeEmpresa}
                                readOnly
                                disabled={camposDesabilitados}
                                placeholder="Selecione uma empresa"
                            />
                            {modo === 'criacao' && (
                                <button
                                    className={styles.selectButton}
                                    onClick={() => setShowEmpresaSelectModal(true)}
                                    disabled={loading}
                                    title="Selecionar empresa"
                                >
                                    <Search size={16} />
                                </button>
                            )}
                        </div>
                        <input
                            type="hidden"
                            value={idEmpresa}
                            readOnly
                        />
                    </div>
                </div>

                {/* Linha 2: CEP + Logradouro */}
                <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="cep">CEP *</label>
                        <div className={styles.inputWithButton}>
                            <input
                                id="cep"
                                type="text"
                                className={styles.inputField}
                                value={cep}
                                onChange={handleCepChange}
                                onBlur={handleCepBlur}
                                disabled={camposDesabilitados}
                                placeholder="00000-000"
                            />
                            {cepLoading && (
                                <span className={styles.cepSpinner}>
                                    <Loader size={18} className={styles.spinnerIcon} />
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.fieldGroupLarge}>
                        <label htmlFor="logradouro">Logradouro *</label>
                        <input
                            id="logradouro"
                            type="text"
                            className={styles.inputField}
                            value={logradouro}
                            onChange={(e) => setLogradouro(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="Rua, Avenida, etc."
                        />
                    </div>
                </div>

                {/* Linha 3: Número + Complemento + Bairro */}
                <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="numero">Número *</label>
                        <input
                            id="numero"
                            type="text"
                            className={styles.inputField}
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="123"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="complemento">Complemento</label>
                        <input
                            id="complemento"
                            type="text"
                            className={styles.inputField}
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="Apto, Bloco, etc."
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="bairro">Bairro *</label>
                        <input
                            id="bairro"
                            type="text"
                            className={styles.inputField}
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="Centro"
                        />
                    </div>
                </div>

                {/* Linha 4: Cidade + Estado */}
                <div className={styles.formRow}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="cidade">Cidade *</label>
                        <input
                            id="cidade"
                            type="text"
                            className={styles.inputField}
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="São Paulo"
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label htmlFor="estado">Estado *</label>
                        <input
                            id="estado"
                            type="text"
                            className={styles.inputField}
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            disabled={camposDesabilitados}
                            placeholder="SP"
                            maxLength={2}
                        />
                    </div>
                </div>
            </div>

            {/* Modais */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Excluir Endereço"
                message="Tem certeza que deseja excluir este endereço?"
                confirmText="Excluir"
                cancelText="Cancelar"
            />

            {/* Modal de pesquisa de endereços (botão de busca no cabeçalho) */}
            <ModalPesquisaFiltroEndereco
                isOpen={showAddressSearchModal}
                onClose={() => setShowAddressSearchModal(false)}
                onSelect={handleSelectFromAddressModal}
            />

            {/* Modal de seleção de empresa (campo Empresa no formulário) */}
            <ModalPesquisaFiltroEmpresa
                isOpen={showEmpresaSelectModal}
                onClose={() => setShowEmpresaSelectModal(false)}
                onSelect={handleSelecionarEmpresa}
            />
        </div>
    );
}

export default EnderecoCadastro;
