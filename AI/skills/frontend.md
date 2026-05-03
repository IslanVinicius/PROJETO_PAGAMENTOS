# Frontend - Guia Completo de Implementação

## 📋 Visão Geral
Guia completo para implementação frontend no Projeto Pagamentos, incluindo padrões React, CSS Modules e integração com backend.

---

## 🏗️ Stack Tecnológica

- **React 19.2.0** (última versão)
- **Vite 7.3.1** (build tool ultra-rápido)
- **CSS Modules** (escopo local de estilos)
- **React Router DOM** (roteamento)
- **Lucide React** (ícones)
- **Axios** (requisições HTTP)
- **Context API** (estado global - AuthContext)
- **Custom Hooks** (lógica reutilizável)

---

## 📁 Estrutura de Diretórios

```
frontend/src/
├── components/
│   ├── Login/                    # Tela de login
│   │   ├── Login.jsx
│   │   ├── Login.module.css
│   │   └── index.js
│   │
│   ├── MainPage/                 # Páginas CRUD principais
│   │   ├── MainPage.jsx          # Layout principal + sidebar
│   │   ├── OrcamentoCadastro.jsx
│   │   ├── OrcamentoCadastro-novo.module.css
│   │   ├── ItemCadastro.jsx
│   │   ├── PrestadorCadastro.jsx
│   │   ├── EmpresaCadastro.jsx
│   │   ├── UserCadastro.jsx
│   │   ├── Dashboard.jsx         # Dashboard administrativo
│   │   ├── ModalPesquisa.jsx     # Modal genérico de busca
│   │   └── ... (outros componentes)
│   │
│   ├── Shared/                   # Componentes reutilizáveis
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── ApprovalModal.jsx
│   │   └── FormLayout.jsx
│   │
│   └── common/                   # Componentes comuns
│       ├── BarraPesquisa.jsx
│       ├── ResultadosPesquisa.jsx
│       └── index.js
│
├── contexts/
│   └── AuthContext.jsx           # Contexto de autenticação JWT
│
├── hooks/                        # Custom hooks
│   ├── useMensagemTemporaria.js
│   └── usePesquisa.js
│
├── services/                     # Serviços API
│   ├── api.js                    # Axios configurado
│   ├── orcamentoService.js
│   ├── itemService.js
│   ├── prestadorService.js
│   ├── empresaService.js
│   ├── authService.js
│   └── dashboardService.js
│
├── routes/
│   └── PrivateRoute.jsx          # Proteção de rotas
│
├── utils/
│   ├── constants.js
│   └── formatters.js
│
├── styles/
│   ├── global.css                # Estilos globais
│   ├── variables.css             # Variáveis CSS (cores, espaçamentos)
│   └── theme.css                 # Tema do sistema
│
├── App.jsx                       # Componente raiz + rotas
└── main.jsx                      # Entry point React
```

---

## 🔄 Fluxo de Criação de Novo CRUD

### Ordem OBRIGATÓRIA de Implementação

#### 1️⃣ **Service API** - `services/xxxService.js`

```javascript
import { api } from './api';

export const xxxService = {
    // Listar todos
    async listar() {
        const response = await api.get('/xxx');
        return await response.json();
    },
    
    // Buscar por ID
    async obter(id) {
        const response = await api.get(`/xxx/${id}`);
        return await response.json();
    },
    
    // Criar
    async criar(dados) {
        const response = await api.post('/xxx', dados);
        return await response.json();
    },
    
    // Atualizar
    async atualizar(id, dados) {
        const response = await api.put(`/xxx/${id}`, dados);
        return await response.json();
    },
    
    // Deletar
    async deletar(id) {
        const response = await api.delete(`/xxx/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};

export default xxxService;
```

**Regras:**
- ✅ Usar `api` configurado (já inclui token JWT automaticamente)
- ✅ Sempre usar `async/await`
- ✅ Retornar JSON parseado
- ✅ Tratar resposta 204 (No Content) em deletes
- ❌ NUNCA fazer cálculos no frontend - apenas exibir dados do backend
- ❌ NUNCA hardcode URLs - usar paths relativos

---

#### 2️⃣ **Componente Principal** - `components/MainPage/XxxCadastro.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { xxxService } from '../../services/xxxService';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';
import styles from './XxxCadastro.module.css';

function XxxCadastro() {
    const navigate = useNavigate();
    const [message, setMessage] = useMensagemTemporaria(3000);
    const [loading, setLoading] = useState(false);
    
    // Estado do formulário
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        ativo: true
    });
    
    // Carregar dados se for edição
    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) {
            carregarDados(id);
        }
    }, []);
    
    const carregarDados = async (id) => {
        setLoading(true);
        try {
            const data = await xxxService.obter(id);
            setFormData(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao carregar dados' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validações
        if (!formData.nome) {
            setMessage({ type: 'error', text: 'Nome é obrigatório' });
            return;
        }
        
        setLoading(true);
        try {
            const id = new URLSearchParams(window.location.search).get('id');
            
            if (id) {
                // Edição
                await xxxService.atualizar(id, formData);
                setMessage({ type: 'success', text: 'Atualizado com sucesso!' });
            } else {
                // Criação
                await xxxService.criar(formData);
                setMessage({ type: 'success', text: 'Criado com sucesso!' });
                setFormData({ nome: '', descricao: '', ativo: true });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao salvar' });
        } finally {
            setLoading(false);
        }
    };
    
    const handleVoltar = () => {
        navigate(-1);
    };
    
    if (loading && !formData.nome) {
        return <div className={styles.loading}>Carregando...</div>;
    }
    
    return (
        <div className={styles.container}>
            {/* Mensagem temporária */}
            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}
            
            {/* Header */}
            <div className={styles.header}>
                <h1>{formData.id ? 'Editar' : 'Novo'} XXX</h1>
                <button onClick={handleVoltar} className={styles.btnVoltar}>
                    Voltar
                </button>
            </div>
            
            {/* Formulário */}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="nome">Nome *</label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="descricao">Descrição</label>
                    <textarea
                        id="descricao"
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>
                
                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="ativo"
                            checked={formData.ativo}
                            onChange={handleChange}
                        />
                        Ativo
                    </label>
                </div>
                
                {/* Botões */}
                <div className={styles.actions}>
                    <button 
                        type="button" 
                        onClick={handleVoltar}
                        className={styles.btnCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className={styles.btnSave}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default XxxCadastro;
```

**Regras:**
- ✅ Usar CSS Modules (`import styles from './XxxCadastro.module.css'`)
- ✅ Estados controlados para formulários
- ✅ Validações no frontend (UX) E no backend (segurança)
- ✅ Loading states durante requisições
- ✅ Mensagens de erro/sucesso claras
- ✅ Tratar modo criação vs edição
- ✅ Usar `useMensagemTemporaria` para feedbacks
- ❌ NUNCA fazer cálculos de negócio no frontend
- ❌ NUNCA acessar localStorage diretamente (usar AuthContext)

---

#### 3️⃣ **CSS Module** - `components/MainPage/XxxCadastro.module.css`

```css
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-xl);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
}

.header h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
}

.form {
    background: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
}

.formGroup {
    margin-bottom: var(--spacing-lg);
}

.formGroup label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
}

.formGroup input,
.formGroup textarea,
.formGroup select {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: 14px;
    transition: all 0.2s ease;
}

.formGroup input:focus,
.formGroup textarea:focus,
.formGroup select:focus {
    outline: none;
    border-color: var(--primary-button);
    box-shadow: 0 0 0 3px rgba(139, 76, 76, 0.1);
}

.actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

.btnSave {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: linear-gradient(135deg, var(--success) 0%, #2d8645 100%);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btnSave:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.btnSave:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btnCancel {
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btnCancel:hover:not(:disabled) {
    background-color: var(--border-light);
}

/* Mensagens */
.message {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    font-weight: 500;
}

.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}

.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    font-size: 16px;
    color: var(--text-secondary);
}
```

**Regras:**
- ✅ **SEMPRE** usar variáveis CSS (`var(--spacing-md)`, `var(--primary-button)`)
- ✅ Classes com camelCase (`.formGroup`, não `.form-group`)
- ✅ Escopo local automático (CSS Modules)
- ✅ Transições suaves (`transition: all 0.2s ease`)
- ✅ Focus states visíveis (acessibilidade)
- ✅ Responsividade com media queries se necessário
- ❌ NUNCA usar cores hardcoded - usar variáveis do `variables.css`
- ❌ NUNCA usar `!important` exceto casos extremos

---

#### 4️⃣ **Rota** - `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import MainPage from './components/MainPage/MainPage';
import XxxCadastro from './components/MainPage/XxxCadastro';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                
                {/* Rotas protegidas */}
                <Route path="/" element={
                    <PrivateRoute>
                        <MainPage />
                    </PrivateRoute>
                }>
                    <Route path="xxx" element={<XxxCadastro />} />
                    {/* Outras rotas */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
```

**Regras:**
- ✅ Todas as rotas internas protegidas por `PrivateRoute`
- ✅ Rota pública apenas `/login`
- ✅ Nested routes dentro de `MainPage`
- ❌ NUNCA expor rotas CRUD sem proteção

---

## 🎨 Padrões de Design Visual

### Paleta de Cores (Marsala + Amarelo + Branco)

```css
/* variables.css */
:root {
    /* Cores primárias */
    --primary-button: #8B4C4C;        /* Marsala */
    --primary-button-hover: #7A4242;  /* Marsala escuro */
    
    /* Cores de destaque */
    --warning: #F0AD4E;               /* Amarelo */
    --warning-hover: #EC971F;
    
    /* Cores de status */
    --success: #5CB85C;               /* Verde */
    --success-hover: #449D44;
    --danger: #D9534F;                /* Vermelho */
    --danger-hover: #C9302C;
    
    /* Cores neutras */
    --text-primary: #333333;
    --text-secondary: #666666;
    --bg-primary: #F5F5F5;
    --bg-secondary: #FFFFFF;
    --border-color: #DDDDDD;
    --border-light: #EEEEEE;
    
    /* Espaçamentos */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    
    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-full: 9999px;
    
    /* Sombras */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-md: 0 4px 8px rgba(0,0,0,0.15);
    --shadow-lg: 0 8px 16px rgba(0,0,0,0.2);
}
```

**Regras:**
- ✅ **SEMPRE** usar variáveis CSS - nunca hardcoded
- ✅ Gradientes sutis para botões primários
- ✅ Sombras consistentes para cards
- ✅ Bordas arredondadas modernas (8-12px)
- ❌ NUNCA inventar novas cores - usar paleta existente

---

## 🔐 Autenticação e Autorização

### AuthContext - Estado Global de Autenticação

```jsx
// contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    
    useEffect(() => {
        if (token) {
            // Decodificar token e obter usuário
            const decoded = decodeJWT(token);
            setUsuario(decoded);
        }
    }, [token]);
    
    const login = (tokenData) => {
        localStorage.setItem('token', tokenData.token);
        setToken(tokenData.token);
        setUsuario(tokenData.usuario);
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    };
    
    const hasRole = (role) => {
        return usuario?.roles?.includes(role);
    };
    
    const isAdmin = () => {
        return hasRole('ADMIN') || hasRole('EXPANSAO');
    };
    
    return (
        <AuthContext.Provider value={{ 
            usuario, 
            token, 
            login, 
            logout,
            hasRole,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
```

### PrivateRoute - Proteção de Rotas

```jsx
// routes/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
    const { token } = useAuth();
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

export default PrivateRoute;
```

**Uso nos componentes:**
```jsx
import { useAuth } from '../../contexts/AuthContext';

function XxxCadastro() {
    const { usuario, isAdmin } = useAuth();
    
    // Mostrar botão apenas para ADMIN
    if (isAdmin()) {
        return <button>Deletar</button>;
    }
    
    return null;
}
```

---

## 💡 Padrões Específicos do Projeto

### 1. Modal de Pesquisa Genérico

**Problema**: Múltiplos cadastros precisam buscar registros existentes

**Solução**: Componente `ModalPesquisa.jsx` reutilizável

```jsx
// components/MainPage/ModalPesquisa.jsx
import React, { useState } from 'react';
import { BarraPesquisa } from '../common';
import { ResultadosPesquisa } from '../common';
import styles from './ModalPesquisa.module.css';

function ModalPesquisa({ 
    titulo, 
    onPesquisar, 
    onSelect, 
    onClose,
    camposVisiveis 
}) {
    const [termo, setTermo] = useState('');
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const handlePesquisar = async () => {
        setLoading(true);
        try {
            const resultados = await onPesquisar(termo);
            setResultados(resultados);
        } catch (error) {
            console.error('Erro na pesquisa:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>{titulo}</h2>
                    <button onClick={onClose}>×</button>
                </div>
                
                <BarraPesquisa
                    valor={termo}
                    onChange={setTermo}
                    onPesquisar={handlePesquisar}
                    placeholder="Digite para pesquisar..."
                />
                
                <ResultadosPesquisa
                    resultados={resultados}
                    loading={loading}
                    onSelect={onSelect}
                    campos={camposVisiveis}
                />
            </div>
        </div>
    );
}

export default ModalPesquisa;
```

**Uso:**
```jsx
const [modalAberto, setModalAberto] = useState(false);

const handleSelecionarItem = (item) => {
    setFormData(prev => ({
        ...prev,
        itemId: item.id,
        nome: item.nome
    }));
    setModalAberto(false);
};

{modalAberto && (
    <ModalPesquisa
        titulo="Selecionar Item"
        onPesquisar={itemService.listar}
        onSelect={handleSelecionarItem}
        onClose={() => setModalAberto(false)}
        camposVisiveis={['nome', 'precoMedio']}
    />
)}
```

---

### 2. Hook useMensagemTemporaria

**Problema**: Mensagens de feedback devem desaparecer automaticamente

**Solução**: Custom hook reutilizável

```jsx
// hooks/useMensagemTemporaria.js
import { useState, useEffect } from 'react';

export function useMensagemTemporaria(duracao = 3000) {
    const [message, setMessage] = useState({ type: '', text: '' });
    
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => {
                setMessage({ type: '', text: '' });
            }, duracao);
            
            return () => clearTimeout(timer);
        }
    }, [message, duracao]);
    
    return [message, setMessage];
}
```

**Uso:**
```jsx
const [message, setMessage] = useMensagemTemporaria(3000);

// Exibir mensagem
setMessage({ type: 'success', text: 'Salvo com sucesso!' });

// No JSX
{message.text && (
    <div className={`${styles.message} ${styles[message.type]}`}>
        {message.text}
    </div>
)}
```

---

### 3. Integração com ViaCEP (Autofill Endereço)

**Padrão**: Backend faz proxy da API externa

```javascript
// services/enderecoService.js
export const enderecoService = {
    async buscarPorCEP(cep) {
        // Backend faz proxy para evitar CORS e expor API key
        const response = await api.get(`/endereco/buscar-cep/${cep}`);
        return await response.json();
    }
};
```

**No componente:**
```jsx
const handleCEPChange = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep }));
    
    if (cep.length === 8) {
        try {
            const endereco = await enderecoService.buscarPorCEP(cep);
            setFormData(prev => ({
                ...prev,
                logradouro: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.localidade, // ⚠️ Campo é "localidade" na API
                uf: endereco.uf
            }));
        } catch (error) {
            setMessage({ type: 'error', text: 'CEP não encontrado' });
        }
    }
};
```

**⚠️ IMPORTANTE**: API ViaCEP retorna `localidade`, não `cidade`!

---

### 4. Dashboard Profissional com Filtros Drill-down

**Padrão SaaS/ERP**: Filtros globais simples + filtros locais contextuais

```jsx
// components/MainPage/Dashboard.jsx
function Dashboard() {
    // Filtros GLOBAIS (topo) - APENAS datas
    const [filtrosGlobais, setFiltrosGlobais] = useState({
        dataInicio: '',
        dataFim: ''
    });
    
    // Filtros LOCAIS por gráfico
    const [filtroEmpresa, setFiltroEmpresa] = useState({
        prestadorIds: [],
        tiposPagamento: []
    });
    
    return (
        <div>
            {/* Filtros Globais */}
            <div className={styles.filtros}>
                <input 
                    type="date" 
                    value={filtrosGlobais.dataInicio}
                    onChange={(e) => setFiltrosGlobais({
                        ...filtrosGlobais, 
                        dataInicio: e.target.value
                    })}
                />
                <button onClick={aplicarFiltros}>Aplicar</button>
            </div>
            
            {/* Gráficos com filtros locais */}
            <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                    <h3>Orçamentos por Empresa</h3>
                    <select 
                        onChange={(e) => adicionarFiltroLocal(e.target.value)}
                    >
                        <option>Filtrar por Prestador</option>
                        {dados?.prestadoresDisponiveis?.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                        ))}
                    </select>
                </div>
                {/* Conteúdo do gráfico */}
            </div>
        </div>
    );
}
```

**Regras:**
- ✅ Filtros globais APENAS para datas
- ✅ Cada gráfico tem seus próprios filtros contextuais
- ✅ Opções de filtro vêm do backend (dados REAIS)
- ✅ Zero mocks ou hardcode
- ❌ NUNCA usar MultiSelect global complexo
- ❌ NUNCA mostrar chips de filtros no topo

---

## ⚠️ Armadilhas Comuns (NÃO FAZER)

### ❌ 1. Usar Cores Hardcoded

```jsx
// ERRADO
<div style={{ backgroundColor: '#8B4C4C' }}>

// CERTO
<div className={styles.container}>

/* CSS */
.container {
    background-color: var(--primary-button);
}
```

---

### ❌ 2. Acessar localStorage Direto

```jsx
// ERRADO
const token = localStorage.getItem('token');

// CERTO
import { useAuth } from '../../contexts/AuthContext';
const { token } = useAuth();
```

---

### ❌ 3. Fazer Cálculos no Frontend

```jsx
// ERRADO - Lógica de negócio no frontend
const total = itens.reduce((sum, item) => {
    const desconto = item.valor * 0.1;
    return sum + (item.valor - desconto);
}, 0);

// CERTO - Backend envia valor calculado
const total = orcamento.valorTotal; // Já vem calculado do backend
```

---

### ❌ 4. Esquecer Loading States

```jsx
// ERRADO
const handleClick = async () => {
    const data = await api.get('/dados');
    setDados(data);
};

// CERTO
const handleClick = async () => {
    setLoading(true);
    try {
        const data = await api.get('/dados');
        setDados(data);
    } catch (error) {
        setMessage({ type: 'error', text: 'Erro' });
    } finally {
        setLoading(false);
    }
};
```

---

### ❌ 5. Não Tratar Erros de API

```jsx
// ERRADO
const data = await api.get('/dados');

// CERTO
try {
    const data = await api.get('/dados');
} catch (error) {
    if (error.response?.status === 403) {
        setMessage({ type: 'error', text: 'Sem permissão' });
    } else if (error.response?.status === 404) {
        setMessage({ type: 'error', text: 'Não encontrado' });
    } else {
        setMessage({ type: 'error', text: 'Erro inesperado' });
    }
}
```

---

## ✅ Checklist de Definição de Pronto

### Novo Componente CRUD
- [ ] Service API criado com todos os métodos (listar, obter, criar, atualizar, deletar)
- [ ] Componente principal criado com estado controlado
- [ ] CSS Module criado com classes scoped
- [ ] Variáveis CSS usadas (nenhuma cor hardcoded)
- [ ] Validações de formulário implementadas
- [ ] Loading states durante requisições
- [ ] Mensagens de erro/sucesso com `useMensagemTemporaria`
- [ ] Modo criação e edição suportados
- [ ] Rota adicionada em `App.jsx`
- [ ] Rota protegida por `PrivateRoute`
- [ ] Build passa sem erros (`npm run build`)
- [ ] Testado manualmente fluxo completo

### Modificação em Componente Existente
- [ ] Estado atualizado corretamente
- [ ] CSS Module modificado (se necessário)
- [ ] Service API atualizado (se mudar endpoint)
- [ ] Tratamento de erros mantido
- [ ] Loading states preservados
- [ ] Build passa
- [ ] Testado manualmente

---

## 📖 Exemplos Reais do Projeto

### Exemplo 1: Orçamento com Itens Manuais e Cadastrados

**Desafio**: Mesmo formulário suporta dois tipos de itens

**Solução Frontend**:
```jsx
// Dois botões diferentes
<button onClick={() => abrirModalItemCadastrado()}>
    Adicionar Item Cadastrado
</button>

<button onClick={() => abrirModalItemManual()}>
    Adicionar Item Manual
</button>

// Estados separados
const [itemCadastrado, setItemCadastrado] = useState({ itemId: null });
const [itemManual, setItemManual] = useState({ 
    nome: '', 
    descricao: '',
    tipoUnitario: '' 
});

// Montar array final
const itensFinais = [
    ...itensCadastrados.map(i => ({ itemId: i.itemId, quantidade: i.qtd })),
    ...itensManuais.map(i => ({ 
        itemId: null,
        nomeManual: i.nome,
        descricaoManual: i.descricao
    }))
];

// Enviar para backend
await orcamentoService.criar({ ...dados, itens: itensFinais });
```

**Lição**: Separar estados mas unificar no envio

---

### Exemplo 2: Corrigir Bug de Modal Transparente

**Problema**: Modal aparecia transparente

**Causa**: Classes CSS não existiam no arquivo `.module.css` correto

**Solução**:
```css
/* OrcamentoCadastro-novo.module.css */
.modalOverlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 1000;
}

.modalContent {
    background-color: white;
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
}
```

**Lição**: CSS Modules exigem classes no arquivo correto

---

### Exemplo 3: Dashboard com Filtros Drill-down

**Implementação**:
- Removido MultiSelect global complexo
- Mantido apenas filtro de datas no topo
- Adicionado selects nativos dentro de cada gráfico
- Opções vêm do backend (empresasDisponiveis, prestadoresDisponiveis)
- Dados 100% reais, zero mocks

**Resultado**: UX profissional tipo Power BI/Tableau

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
cd frontend
npm run dev              # Servidor de desenvolvimento (hot reload)

# Build
npm run build            # Build de produção

# Lint
npm run lint             # Verificar código

# Preview do build
npm run preview          # Visualizar build de produção
```

---

**Última atualização**: 2026-05-01  
**Versão**: 2.0  
**Baseado em**: Memória completa do projeto + lições aprendidas
