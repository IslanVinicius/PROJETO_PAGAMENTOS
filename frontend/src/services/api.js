// Em desenvolvimento, usa a variável de ambiente ou localhost
// Em produção (quando servido pelo Spring Boot), usa caminho relativo '/api'
const getBaseUrl = () => {
    // Se VITE_API_URL estiver definido, usa ele (desenvolvimento)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // Detecta se está em produção (servido pelo Spring Boot)
    // Quando o React é servido como static files, window.location.origin aponta para o Spring Boot
    const isProduction = !window.location.port || 
                        window.location.port === '8080' || 
                        window.location.hostname !== 'localhost';
    
    if (isProduction) {
        return '/api'; // Caminho relativo - funciona quando servido pelo mesmo servidor
    }
    
    // Fallback para desenvolvimento com Vite
    return 'http://localhost:8080/api';
};

const API_URL = getBaseUrl();

const getToken = () => localStorage.getItem('token');

const handleLogout = (message = 'Sessão expirada. Faça login novamente.') => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Mostrar mensagem antes de redirecionar
    alert(message);
    
    window.location.href = '/login';
};

// Endpoints que não precisam de autenticação
const publicEndpoints = ['/auth/login', '/auth/register'];

export const apiRequest = async (endpoint, options = {}) => {
    const isPublic = publicEndpoints.some(pub => endpoint.startsWith(pub));
    const token = isPublic ? null : getToken(); // Não pega token se for público

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Se for 401 ou 403 e não for endpoint público, faz logout
        if ((response.status === 401 || response.status === 403) && !isPublic) {
            const errorMessage = response.status === 403 
                ? 'Acesso negado. Sua sessão pode ter expirado. Faça login novamente.'
                : 'Sessão expirada. Faça login novamente.';
            handleLogout(errorMessage);
            throw new Error(errorMessage);
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erro ${response.status}`);
        }

        return response;
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            console.error('Erro de conexão com o servidor');
        }
        
        // Verificar se é erro de autenticação/autorização
        if (error.message && (
            error.message.includes('401') || 
            error.message.includes('403') ||
            error.message.includes('Sessão expirada') ||
            error.message.includes('Acesso negado')
        )) {
            handleLogout(error.message);
        }
        
        throw error;
    }
};

export const api = {
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (endpoint) => apiRequest(endpoint, {
        method: 'DELETE',
    }),
};