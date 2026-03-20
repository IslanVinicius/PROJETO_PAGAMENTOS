import React, { useState, useEffect } from 'react';
import { FormLayout, FormGroup, FormField, FormSelect, FormRow } from '../../Shared/FormLayout';
import { userService } from '../../services/userService';
import styles from './FormulariosPadraoModerno.module.css';

function UserCadastroModerno() {
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        carregarUsers();
    }, []);

    const carregarUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.listar();
            setUsers(data || []);
            if (data && data.length > 0) {
                selecionarUser(data[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarUser = (user, index) => {
        setCurrentIndex(index);
        setUserId(user.id);
        setUsername(user.username);
        setEmail(user.email);
        setPassword('');
        setRole(user.role || 'SOLICITANTE');
        setModo('visualizacao');
        setErrors({});
        setMessage(null);
    };

    const validarCampos = () => {
        const novoErros = {};
        if (!username.trim()) novoErros.username = 'Usuário é obrigatório';
        if (!email.trim()) novoErros.email = 'Email é obrigatório';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) novoErros.email = 'Email inválido';
        if (modo === 'criacao' && !password.trim()) novoErros.password = 'Senha é obrigatória';
        if (!role) novoErros.role = 'Função é obrigatória';
        setErrors(novoErros);
        return Object.keys(novoErros).length === 0;
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = users.filter(u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} usuário(s) encontrado(s)` : 'Nenhum usuário encontrado'
        });
    };

    const handleNovo = () => {
        setUserId('');
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('SOLICITANTE');
        setModo('criacao');
        setErrors({});
        setMessage(null);
    };

    const handleEditar = () => {
        setModo('edicao');
        setErrors({});
        setMessage(null);
    };

    const handleCancelar = () => {
        setModo('visualizacao');
        setErrors({});
        setMessage(null);
        if (currentIndex >= 0) {
            selecionarUser(users[currentIndex], currentIndex);
        }
    };

    const handleSave = async () => {
        if (!validarCampos()) return;

        const dados = {
            username,
            email,
            role
        };

        if (password) dados.password = password;

        setLoading(true);
        try {
            if (modo === 'edicao' && userId) {
                await userService.atualizar(userId, dados);
                setUsers(prev =>
                    prev.map(u => u.id === userId ? { ...u, username, email, role } : u)
                );
                setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
            } else if (modo === 'criacao') {
                const novo = await userService.criar(dados);
                const novaLista = [...users, novo];
                setUsers(novaLista);
                setMessage({ type: 'success', text: 'Usuário cadastrado com sucesso!' });
                selecionarUser(novo, novaLista.length - 1);
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userId || !window.confirm(`Excluir ${username}?`)) return;

        setLoading(true);
        try {
            await userService.deletar(userId);
            const filtered = users.filter(u => u.id !== userId);
            setUsers(filtered);

            if (filtered.length === 0) {
                setUserId('');
                setUsername('');
                setEmail('');
                setPassword('');
                setRole('SOLICITANTE');
                setCurrentIndex(-1);
            } else {
                const newIndex = Math.min(currentIndex, filtered.length - 1);
                selecionarUser(filtered[newIndex], newIndex);
            }
            setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
            setModo('visualizacao');
        }
    };

    const handleNavNext = () => {
        if (currentIndex < users.length - 1) {
            selecionarUser(users[currentIndex + 1], currentIndex + 1);
        }
    };

    const handleNavPrev = () => {
        if (currentIndex > 0) {
            selecionarUser(users[currentIndex - 1], currentIndex - 1);
        }
    };

    const rolesOptions = [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'SOLICITANTE', label: 'Solicitante' },
        { value: 'ESCRITORIO', label: 'Escritório' },
        { value: 'APROVADOR', label: 'Aprovador' }
    ];

    const formContent = (
        <div>
            <FormGroup title="👤 Informações do Usuário">
                <FormRow>
                    <FormField
                        label="ID"
                        value={userId}
                        disabled
                        placeholder="Gerado automaticamente"
                    />
                    <FormField
                        label="Usuário"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors({ ...errors, username: null }); }}
                        placeholder="Digite o nome de usuário"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.username}
                    />
                </FormRow>

                <FormRow>
                    <FormField
                        label="Email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: null }); }}
                        type="email"
                        placeholder="usuario@email.com"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.email}
                    />
                    <FormSelect
                        label="Função"
                        value={role}
                        onChange={(e) => { setRole(e.target.value); if (errors.role) setErrors({ ...errors, role: null }); }}
                        options={rolesOptions}
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.role}
                    />
                </FormRow>

                {(modo === 'criacao' || modo === 'edicao') && (
                    <FormField
                        label={modo === 'criacao' ? 'Senha *' : 'Nova Senha (deixe em branco para manter)'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: null }); }}
                        type="password"
                        placeholder="Digite a senha"
                        required={modo === 'criacao'}
                        error={errors.password}
                    />
                )}
            </FormGroup>

            {modo === 'visualizacao' && (
                <FormGroup title="🔍 Pesquisar">
                    <div className={styles.searchBox}>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Pesquisar por usuário ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className={styles.searchInput}
                            />
                            <button onClick={handleSearch} className={styles.searchBtn}>
                                🔍 Pesquisar
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className={styles.resultsList}>
                                {searchResults.map((user, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.resultItem}
                                        onClick={() => {
                                            selecionarUser(user, users.findIndex(u => u.id === user.id));
                                            setSearchResults([]);
                                        }}
                                    >
                                        <div>
                                            <div className={styles.resultName}>{user.username}</div>
                                            <div className={styles.resultCnpj}>{user.email}</div>
                                        </div>
                                        <span>→</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </FormGroup>
            )}
        </div>
    );

    return (
        <div>
            <FormLayout
                title={modo === 'criacao' ? 'Novo Usuário' : modo === 'edicao' ? 'Editar Usuário' : 'Cadastro de Usuários'}
                icon="👤"
                message={message}
                loading={loading}
                onSubmit={handleSave}
                onCancel={handleCancelar}
                showCancel={modo !== 'visualizacao'}
                submitLabel={modo === 'criacao' ? 'Cadastrar' : modo === 'edicao' ? 'Atualizar' : 'Salvar'}
            >
                {formContent}
            </FormLayout>

            {modo === 'visualizacao' && users.length > 0 && (
                <div className={styles.toolbar}>
                    <button onClick={handleEditar} className={styles.toolBtn + ' ' + styles.edit} disabled={!userId}>
                        ✏️ Editar
                    </button>
                    <button onClick={handleDelete} className={styles.toolBtn + ' ' + styles.delete} disabled={!userId}>
                        🗑️ Deletar
                    </button>
                    <button onClick={handleNovo} className={styles.toolBtn + ' ' + styles.add}>
                        ➕ Novo
                    </button>
                </div>
            )}

            {modo === 'visualizacao' && users.length > 0 && (
                <div className={styles.navBar}>
                    <button onClick={handleNavPrev} disabled={currentIndex <= 0} className={styles.navBtn}>
                        ← Anterior
                    </button>
                    <span className={styles.counter}>
                        {users.length > 0 ? `${currentIndex + 1} de ${users.length}` : 'Nenhum registro'}
                    </span>
                    <button onClick={handleNavNext} disabled={currentIndex >= users.length - 1} className={styles.navBtn}>
                        Próximo →
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserCadastroModerno;

