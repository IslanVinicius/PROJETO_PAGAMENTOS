# Solução: Logout Automático quando Token Expira

## 🐛 Problema Identificado

**Sintoma**: 
- Usuário faz login e recebe token JWT (válido por 24 horas)
- Após 24 horas, token expira
- Frontend NÃO detecta expiração automaticamente
- Todas as requisições retornam **403 Forbidden**
- Usuário não consegue fazer logout nem login novamente
- Único jeito: limpar localStorage manualmente

**Causa Raiz**:
1. AuthContext validava token apenas na inicialização da página
2. API interceptava apenas erro 401 (Unauthorized), mas JWT expirado retorna 403 (Forbidden)
3. Não havia verificação periódica de expiração
4. Não havia tratamento global para erros 403

---

## ✅ Solução Implementada

### 1. **Interceptor de Erros 403 no api.js**

**Arquivo**: `frontend/src/services/api.js`

```javascript
// ANTES - Apenas 401
if (response.status === 401 && !isPublic) {
    handleLogout();
}

// DEPOIS - 401 E 403
if ((response.status === 401 || response.status === 403) && !isPublic) {
    const errorMessage = response.status === 403 
        ? 'Acesso negado. Sua sessão pode ter expirado. Faça login novamente.'
        : 'Sessão expirada. Faça login novamente.';
    handleLogout(errorMessage);
}
```

**O que faz**:
- Detecta respostas 403 do backend
- Mostra mensagem clara ao usuário
- Limpa token do localStorage
- Redireciona para /login automaticamente

---

### 2. **Verificação Periódica no AuthContext**

**Arquivo**: `frontend/src/contexts/AuthContext.jsx`

```javascript
// Verificar expiração do token periodicamente (a cada 5 minutos)
useEffect(() => {
  const checkTokenExpiration = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Se o token expirou, faz logout automático
      if (decoded.exp && decoded.exp < currentTime) {
        console.log("Token expirado, fazendo logout automático...");
        logout();
      }
    } catch (error) {
      console.error("Erro ao verificar expiração do token:", error);
      logout();
    }
  };

  // Verificar a cada 5 minutos (300000 ms)
  const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
  
  return () => clearInterval(interval);
}, []);
```

**O que faz**:
- Verifica expiração a cada 5 minutos
- Faz logout automático se token expirou
- Previne que usuário fique "preso" com token inválido
- Limpa interval quando componente desmonta (evita memory leaks)

---

### 3. **Mensagem Clara ao Usuário**

**Arquivo**: `frontend/src/services/api.js`

```javascript
const handleLogout = (message = 'Sessão expirada. Faça login novamente.') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Mostrar mensagem antes de redirecionar
    alert(message);
    
    window.location.href = '/login';
};
```

**O que faz**:
- Mostra alert com mensagem explicativa
- Diferencia entre 401 (sessão expirada) e 403 (acesso negado)
- Limpa todos os dados de autenticação
- Redireciona para login

---

### 4. **Função isTokenValid() para Verificação Manual**

**Arquivo**: `frontend/src/contexts/AuthContext.jsx`

```javascript
// Função para verificar manualmente se o token é válido
function isTokenValid() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Exportar no context
<AuthContext.Provider value={{ user, login, logout, isTokenValid }}>
```

**Como usar em componentes**:
```jsx
import { useAuth } from '../../contexts/AuthContext';

function MeuComponente() {
  const { isTokenValid } = useAuth();
  
  const handleClick = () => {
    if (!isTokenValid()) {
      alert('Sua sessão expirou. Faça login novamente.');
      return;
    }
    
    // Prosseguir com ação...
  };
}
```

---

## 🎯 Resultado Final

### Comportamento ANTES da correção:
1. ❌ Token expira após 24h
2. ❌ Usuário tenta acessar qualquer funcionalidade
3. ❌ Backend retorna 403
4. ❌ Frontend NÃO trata erro
5. ❌ Usuário fica "preso" - não consegue logout nem login
6. ❌ Único jeito: F12 → Application → LocalStorage → Delete token

### Comportamento DEPOIS da correção:
1. ✅ Token expira após 24h
2. ✅ Usuário tenta acessar qualquer funcionalidade
3. ✅ Backend retorna 403
4. ✅ Frontend DETECTA erro 403
5. ✅ Mostra mensagem: "Acesso negado. Sua sessão pode ter expirado..."
6. ✅ Limpa token automaticamente
7. ✅ Redireciona para /login
8. ✅ Usuário faz login normalmente

**OU** (se usuário estiver com página aberta por mais de 24h):

1. ✅ A cada 5 minutos, verifica expiração
2. ✅ Detecta que token expirou
3. ✅ Faz logout automático
4. ✅ Redireciona para /login
5. ✅ Usuário faz login novamente

---

## 📊 Fluxos de Detecção

### Fluxo 1: Detecção por Interceptor (Imediato)
```
Usuário clica em botão 
    ↓
Frontend faz requisição API
    ↓
Backend retorna 403 (token expirado)
    ↓
api.js intercepta resposta
    ↓
handleLogout() é chamado
    ↓
Alert: "Acesso negado. Sua sessão expirou..."
    ↓
localStorage limpo
    ↓
Redireciona para /login
```

**Tempo de detecção**: Imediato (na próxima requisição)

---

### Fluxo 2: Detecção Periódica (Preventivo)
```
useEffect roda a cada 5 minutos
    ↓
Lê token do localStorage
    ↓
Decodifica JWT com jwt-decode
    ↓
Compara exp com currentTime
    ↓
Se exp < currentTime → token expirado
    ↓
logout() é chamado
    ↓
Redireciona para /login
```

**Tempo de detecção**: Máximo 5 minutos após expiração

---

### Fluxo 3: Detecção na Inicialização (Já existia)
```
Página é carregada/recarregada
    ↓
AuthProvider inicializa
    ↓
Lê token do localStorage
    ↓
Decodifica e valida expiração
    ↓
Se expirado → remove token e retorna null
    ↓
PrivateRoute redireciona para /login
```

**Tempo de detecção**: Na próxima recarga de página

---

## 🧪 Como Testar

### Teste 1: Simular Token Expirado (Rápido)

1. **Abrir DevTools** (F12)
2. **Ir para Console**
3. **Executar**:
```javascript
// Decodificar token atual
const token = localStorage.getItem('token');
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('Expira em:', new Date(decoded.exp * 1000));

// Forçar expiração (definir exp para 1 segundo atrás)
decoded.exp = Math.floor(Date.now() / 1000) - 1;
const novoToken = token.split('.')[0] + '.' + btoa(JSON.stringify(decoded)) + '.' + token.split('.')[2];
localStorage.setItem('token', novoToken);

console.log('Token forçado como expirado!');
```

4. **Tentar acessar qualquer funcionalidade** (ex: listar orçamentos)
5. **Resultado esperado**:
   - Alert aparece: "Acesso negado. Sua sessão pode ter expirado..."
   - Redireciona para /login automaticamente
   - Token removido do localStorage

---

### Teste 2: Aguardar Verificação Periódica

1. **Fazer login normalmente**
2. **Deixar aba aberta**
3. **Aguardar 24h + 5min** (ou modificar intervalo para teste rápido)
4. **Resultado esperado**:
   - Após 5 minutos da expiração, logout automático ocorre
   - Redireciona para /login
   - Mensagem no console: "Token expirado, fazendo logout automático..."

**Para teste rápido**, modificar intervalo no AuthContext:
```javascript
// Mudar de 5 minutos para 10 segundos (apenas para teste!)
const interval = setInterval(checkTokenExpiration, 10 * 1000);
```

---

### Teste 3: Verificar isTokenValid()

1. **Adicionar em qualquer componente**:
```jsx
import { useAuth } from '../../contexts/AuthContext';

function TesteToken() {
  const { isTokenValid } = useAuth();
  
  return (
    <div>
      <p>Token válido: {isTokenValid() ? 'Sim' : 'Não'}</p>
      <button onClick={() => console.log('Válido:', isTokenValid())}>
        Verificar
      </button>
    </div>
  );
}
```

2. **Clicar no botão antes e depois da expiração**
3. **Resultado esperado**:
   - Antes: "Token válido: Sim"
   - Depois: "Token válido: Não"

---

## 🔧 Configurações Avançadas

### Ajustar Intervalo de Verificação

**Arquivo**: `frontend/src/contexts/AuthContext.jsx`

```javascript
// Padrão: 5 minutos
const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

// Para verificação mais frequente (1 minuto)
const interval = setInterval(checkTokenExpiration, 1 * 60 * 1000);

// Para verificação menos frequente (10 minutos)
const interval = setInterval(checkTokenExpiration, 10 * 60 * 1000);
```

**Recomendação**: 5 minutos é ideal (balanceia performance e responsividade)

---

### Customizar Mensagens

**Arquivo**: `frontend/src/services/api.js`

```javascript
const handleLogout = (message = 'Sessão expirada. Faça login novamente.') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Usar modal customizado ao invés de alert
    // showCustomModal(message);
    
    alert(message); // Ou manter alert simples
    
    window.location.href = '/login';
};
```

---

### Adicionar Logging para Debugging

**Arquivo**: `frontend/src/contexts/AuthContext.jsx`

```javascript
const checkTokenExpiration = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log('[AuthContext] Nenhum token encontrado');
      return;
    }
    
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    console.log(`[AuthContext] Token expira em ${Math.round(timeUntilExpiry / 60)} minutos`);
    
    if (decoded.exp && decoded.exp < currentTime) {
      console.log("[AuthContext] Token expirado, fazendo logout automático...");
      logout();
    }
  } catch (error) {
    console.error("[AuthContext] Erro ao verificar expiração:", error);
    logout();
  }
};
```

---

## ⚠️ Pontos de Atenção

### 1. **jwt-decode já está instalado?**

Verificar em `package.json`:
```json
{
  "dependencies": {
    "jwt-decode": "^3.1.2"
  }
}
```

Se não estiver:
```bash
cd frontend
npm install jwt-decode
```

---

### 2. **Backend deve retornar 403, não 401**

Quando token JWT expira, Spring Security retorna:
- **401 Unauthorized**: Token ausente ou inválido
- **403 Forbidden**: Token presente mas expirado/sem permissão

Verificar em `SecurityConfig.java`:
```java
// Configuração correta para JWT
.exceptionHandling(exceptions -> exceptions
    .authenticationEntryPoint((request, response, authException) -> {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
    })
    .accessDeniedHandler((request, response, accessDeniedException) -> {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
    })
)
```

---

### 3. **Não conflitar com PrivateRoute**

`PrivateRoute.jsx` já verifica token na montagem:
```jsx
function PrivateRoute({ children }) {
    const { token } = useAuth();
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}
```

**Funciona em conjunto** com as novas verificações:
- PrivateRoute: Protege rotas na navegação
- api.js: Intercepta erros de requisições
- AuthContext useEffect: Verifica periodicamente

---

## 📝 Resumo das Alterações

| Arquivo | Alteração | Linha(s) |
|---------|-----------|----------|
| `api.js` | Adicionado tratamento para 403 | ~52-58 |
| `api.js` | Mensagens diferenciadas (401 vs 403) | ~54-56 |
| `api.js` | Handler de erros no catch | ~70-80 |
| `AuthContext.jsx` | Import useEffect | ~1 |
| `AuthContext.jsx` | useEffect com verificação periódica | ~32-57 |
| `AuthContext.jsx` | Função isTokenValid() | ~75-87 |
| `AuthContext.jsx` | Export isTokenValid no context | ~91 |

**Total**: ~60 linhas adicionadas/modificadas

---

## ✅ Checklist de Validação

- [x] Interceptor captura erro 403
- [x] Mensagem clara exibida ao usuário
- [x] Token removido do localStorage
- [x] Redirecionamento para /login funciona
- [x] Verificação periódica roda a cada 5min
- [x] isTokenValid() disponível para uso manual
- [x] Sem errors no console
- [x] Build passa sem warnings
- [x] Testado com token expirado simulado

---

## 🚀 Próximos Passos Sugeridos

1. **Implementar refresh token** (opcional, para evitar logout)
2. **Adicionar countdown visual** ("Sessão expira em X minutos")
3. **Modal customizado** ao invés de alert()
4. **Notificação toast** mais elegante
5. **Opção "Lembrar-me"** para sessões mais longas

---

**Data da correção**: 2026-05-01  
**Versão**: 1.0  
**Status**: ✅ Implementado e testado
