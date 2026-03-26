import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X, User } from 'lucide-react';
import styles from './UserCadastro-novo.module.css';
import { userService } from '../../services/userService';
import ConfirmModal from '../Shared/ConfirmModal';
import { BarraPesquisa, ResultadosPesquisa } from '../common';
import { usePesquisa } from '../../hooks/usePesquisa';

function UserCadastro() {
    const [id, setId] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Lista de roles disponíveis
    const roles = ['ADMIN', 'SOLICITANTE', 'ESCRITORIO', 'APROVADOR'];

    // Configuração dos campos de pesquisa
    const camposPesquisaUsuario = [
        { campo: 'username', label: 'Usuário' },
        { campo: 'role', label: 'Permissão' },
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
    } = usePesquisa(users, camposPesquisaUsuario);

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const carregarUsuarios = async () => {
        setLoading(true);
        try {
            const data = await userService.listar();
            const usersFormatados = data.map(item => ({
                id: item.id,
                username: item.username,
                password: '', // não recebemos senha do backend por segurança
                role: item.role
            }));
            setUsers(usersFormatados);
            if (usersFormatados.length > 0) {
                selecionarUsuario(usersFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarUsuario = (user, index) => {
        setCurrentIndex(index);
        setId(user.id);
        setUsername(user.username);
        setPassword(''); // senha não é retornada, deixamos vazio
        setRole(user.role);
        setOriginalData({ ...user });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = users.filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum usuário encontrado'
        });
    };

    const selectUsuario = (user) => {
        const index = users.findIndex(u => u.id === user.id);
        selecionarUsuario(user, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handleEditar = () => {
        setOriginalData({ id, username, password, role });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setId('');
        setUsername('');
        setPassword('');
        setRole('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.id) {
            setId(originalData.id);
            setUsername(originalData.username);
            setPassword(''); // não restauramos senha
            setRole(originalData.role);
        } else if (modo === 'criacao' && users.length > 0 && currentIndex >= 0) {
            const atual = users[currentIndex];
            setId(atual.id);
            setUsername(atual.username);
            setPassword('');
            setRole(atual.role);
        } else if (modo === 'criacao' && users.length === 0) {
            setId('');
            setUsername('');
            setPassword('');
            setRole('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!username || !role) {
            setMessage({ type: 'error', text: 'Preencha os campos obrigatórios!' });
            return;
        }

        const dados = { username, role };

        // Se for criação, a senha é obrigatória
        if (modo === 'criacao') {
            if (!password) {
                setMessage({ type: 'error', text: 'Senha é obrigatória!' });
                return;
            }
            dados.password = password;
        }

        // Se for edição e a senha foi preenchida, atualiza
        if (modo === 'edicao' && password) {
            dados.password = password;
        }

        setLoading(true);
        try {
            if (modo === 'edicao' && id) {
                const atualizado = await userService.atualizar(id, dados);
                const userMapeado = {
                    id: atualizado.id,
                    username: atualizado.username,
                    password: '',
                    role: atualizado.role
                };
                setUsers(prev => prev.map(u => u.id === id ? userMapeado : u));
                setOriginalData(userMapeado);
                setMessage({ type: 'success', text: 'Usuário atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await userService.criar(dados);
                const novoMapeado = {
                    id: novo.id,
                    username: novo.username,
                    password: '',
                    role: novo.role
                };
                setUsers(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarUsuario(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Usuário cadastrado!' });
            }
            setModo('visualizacao');
            setPassword(''); // limpa campo senha
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!id) {
            setMessage({ type: 'error', text: 'Selecione um usuário!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await userService.deletar(id);
            const filtered = users.filter(u => u.id !== id);
            setUsers(filtered);
            if (filtered.length === 0) {
                setId('');
                setUsername('');
                setPassword('');
                setRole('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) newIndex = filtered.length - 1;
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setId(current.id);
                setUsername(current.username);
                setPassword('');
                setRole(current.role);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Usuário excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < users.length - 1) {
            const next = users[currentIndex + 1];
            selecionarUsuario(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = users[currentIndex - 1];
            selecionarUsuario(prev, currentIndex - 1);
        }
    };

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (users.length > 0 && currentIndex !== 0) {
            selecionarUsuario(users[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (users.length > 0 && currentIndex !== users.length - 1) {
            const lastIndex = users.length - 1;
            selecionarUsuario(users[lastIndex], lastIndex);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
                        <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <h2>Cadastro de Usuário</h2>
                </div>
                <div className={styles.headerControls}>
                    <div className={styles.quickSearchGroup}>
                        <input
                            type="text"
                            className={styles.quickSearchInput}
                            placeholder="ID..."
                            disabled={loading || modo !== 'visualizacao'}
                        />
                        <button
                            className={styles.searchIconButton}
                            onClick={handlePesquisar}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Pesquisar"
                        >
                            <Search size={20} />
                        </button>
                    </div>

                    {modo === 'visualizacao' && (
                        <div className={styles.headerActionButtons}>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnEdit}`}
                                onClick={handleEditar}
                                disabled={loading || !id}
                                title="Editar usuário"
                            >
                                <Edit2 size={18} /> Editar
                            </button>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                                title="Criar novo usuário"
                            >
                                <Plus size={18} /> Novo
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
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnDelete}`}
                                onClick={handleDeleteClick}
                                disabled={loading || !id}
                                title="Excluir usuário"
                            >
                                <Trash2 size={18} /> Excluir
                            </button>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar edição"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </div>
                    )}
                    {modo === 'criacao' && (
                        <div className={styles.headerActionButtons}>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                                title="Salvar novo usuário"
                            >
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.headerBtn} ${styles.headerBtnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar criação"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </div>
                    )}

                    {users.length > 0 && modo === 'visualizacao' && (
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${users.length}` : `0/${users.length}`}
                            </span>
                            <button
                                className={styles.navButton}
                                onClick={handleNext}
                                disabled={currentIndex >= users.length - 1 || loading}
                                title="Próximo"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={currentIndex >= users.length - 1 || loading}
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
                                {currentIndex >= 0 ? `${currentIndex + 1}/${users.length}` : `0/${users.length}`}
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
                message="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
                itemName={username}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default UserCadastro;