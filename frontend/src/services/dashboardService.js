import { api } from './api';

// Função auxiliar para obter a URL base (mesma lógica do api.js)
const getBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    const isProduction = !window.location.port || 
                        window.location.port === '8080' || 
                        window.location.hostname !== 'localhost';
    
    if (isProduction) {
        return '/api';
    }
    
    return 'http://localhost:8080/api';
};

export const dashboardService = {
    /**
     * Obtém resumo/KPIs do dashboard
     */
    async obterResumo(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null,
            empresaIds: filtros.empresaIds && filtros.empresaIds.length > 0 ? filtros.empresaIds : null,
            prestadorIds: filtros.prestadorIds && filtros.prestadorIds.length > 0 ? filtros.prestadorIds : null,
            tiposPagamento: filtros.tiposPagamento && filtros.tiposPagamento.length > 0 ? filtros.tiposPagamento : null
        };

        const response = await api.post('/dashboard/resumo', body);
        return await response.json();
    },

    /**
     * Obtém dados de evolução temporal
     */
    async obterEvolucao(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null
        };

        const response = await api.post('/dashboard/evolucao', body);
        return await response.json();
    },

    /**
     * Obtém ranking de prestadores
     */
    async obterPrestadores(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null
        };

        const response = await api.post('/dashboard/prestadores', body);
        return await response.json();
    },

    /**
     * Obtém distribuição por status
     */
    async obterStatus(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null
        };

        const response = await api.post('/dashboard/status', body);
        return await response.json();
    },

    /**
     * Obtém últimos orçamentos
     */
    async obterUltimos(filtros = {}, limite = 10) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null
        };

        const response = await api.post(`/dashboard/ultimos?limite=${limite}`, body);
        return await response.json();
    },

    /**
     * Busca orçamentos com filtros avançados e paginação (Tabela Profissional)
     */
    async buscarOrcamentos(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null,
            usuarioCriadorId: filtros.usuarioCriadorId || null,
            prestadorId: filtros.prestadorId || null,
            empresaId: filtros.empresaId || null,
            descricao: filtros.descricao || null,
            tipoPagamento: filtros.tipoPagamento || null,
            valorMin: filtros.valorMin || null,
            valorMax: filtros.valorMax || null,
            page: filtros.page || 0,
            size: filtros.size || 10,
            sortBy: filtros.sortBy || 'movimento',
            sortDirection: filtros.sortDirection || 'desc'
        };

        const response = await api.post('/dashboard/orcamentos', body);
        return await response.json();
    },

    /**
     * Exporta orçamentos para CSV
     */
    async exportarCSV(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null,
            usuarioCriadorId: filtros.usuarioCriadorId || null,
            prestadorId: filtros.prestadorId || null,
            empresaId: filtros.empresaId || null,
            descricao: filtros.descricao || null,
            tipoPagamento: filtros.tipoPagamento || null,
            valorMin: filtros.valorMin || null,
            valorMax: filtros.valorMax || null,
            sortBy: filtros.sortBy || 'movimento',
            sortDirection: filtros.sortDirection || 'desc'
        };

        const token = localStorage.getItem('token');
        const baseUrl = getBaseUrl();
        
        const response = await fetch(`${baseUrl}/dashboard/orcamentos/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('Erro ao exportar CSV');
        }

        // Download do arquivo
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orcamentos_export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    /**
     * Lista usuários para filtros
     */
    async listarUsuarios() {
        const response = await api.get('/dashboard/filtros/usuarios');
        return await response.json();
    },

    /**
     * Lista prestadores para filtros
     */
    async listarPrestadores() {
        const response = await api.get('/dashboard/filtros/prestadores');
        return await response.json();
    },

    /**
     * Lista empresas para filtros
     */
    async listarEmpresas() {
        const response = await api.get('/dashboard/filtros/empresas');
        return await response.json();
    },

    /**
     * Lista tipos de pagamento para filtros
     */
    async listarTiposPagamento() {
        const response = await api.get('/dashboard/filtros/tipos-pagamento');
        return await response.json();
    }
};

export default dashboardService;
