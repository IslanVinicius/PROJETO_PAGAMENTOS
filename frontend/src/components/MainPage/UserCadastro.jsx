import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Edit2, Trash2, Save, X, User } from 'lucide-react';
import styles from './UserCadastro-novo.module.css';
import { userService } from '../../services/userService';

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

    // Lista de roles disponíveis
    const roles = ['ADMIN', 'SOLICITANTE', 'ESCRITORIO', 'APROVADOR'];

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

    const handleDelete = async () => {
        if (!id) {
            setMessage({ type: 'error', text: 'Selecione um usuário!' });
            return;
        }
        if (!window.confirm(`Excluir usuário ${username}?`)) return;

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

    const camposDesabilitados = modo === 'visualizacao' || loading;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>👤</span>
                    <h2>Cadastro de Usuário</h2>
                </div>
                {users.length > 0 && modo === 'visualizacao' && (
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
                    </div>
                )}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                        <button className={styles.navButton} disabled>
                            <ChevronLeft size={20} />
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${users.length}` : `0/${users.length}`}
                        </span>
                        <button className={styles.navButton} disabled>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Pesquisar por nome de usuário ou permissão..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={loading || modo !== 'visualizacao'}
                    />
                    <button className={styles.searchButton} onClick={handleSearch} disabled={loading || modo !== 'visualizacao'}>
                        <Search size={18} /> Pesquisar
                    </button>
                </div>
                {searchResults.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.resultsList}>
                        {searchResults.map(user => (
                            <div key={user.id} className={styles.resultItem} onClick={() => selectUsuario(user)}>
                                <div className={styles.resultItemInfo}>
                                    <span className={styles.resultItemName}>{user.username}</span>
                                    <span className={styles.resultItemDoc}>Permissão: {user.role}</span>
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
                        <label>ID</label>
                        <input type="text" value={id || ''} disabled placeholder="Automático" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>USUÁRIO *</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nome de usuário"
                            disabled={camposDesabilitados}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>SENHA {modo === 'criacao' ? '*' : '(opcional na edição)'}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={modo === 'criacao' ? 'Digite a senha' : 'Deixe em branco para manter'}
                            disabled={camposDesabilitados}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>PERMISSÃO *</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            disabled={camposDesabilitados}
                            className={styles.select}
                        >
                            <option value="">Selecione...</option>
                            {roles.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {modo === 'visualizacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnEdit}`}
                                onClick={handleEditar}
                                disabled={loading || !id}
                                title="Editar usuário"
                            >
                                <Edit2 size={18} /> Editar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                                title="Criar novo usuário"
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
                                disabled={loading || !id}
                                title="Excluir usuário"
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
                                title="Salvar novo usuário"
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

export default UserCadastro;