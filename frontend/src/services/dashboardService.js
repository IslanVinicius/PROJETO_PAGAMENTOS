import { api } from './api';

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
    }
};

export default dashboardService;
