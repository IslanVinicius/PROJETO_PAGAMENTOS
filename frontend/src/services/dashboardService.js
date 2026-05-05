import { api } from './api';

export const dashboardService = {
    async obterDados(filtros = {}) {
        const body = {
            dataInicio: filtros.dataInicio || null,
            dataFim: filtros.dataFim || null,
            empresaIds: filtros.empresaIds && filtros.empresaIds.length > 0 ? filtros.empresaIds : null,
            prestadorIds: filtros.prestadorIds && filtros.prestadorIds.length > 0 ? filtros.prestadorIds : null,
            tiposPagamento: filtros.tiposPagamento && filtros.tiposPagamento.length > 0 ? filtros.tiposPagamento : null
        };

        const response = await api.post('/dashboard', body);
        return await response.json();
    }
};

export default dashboardService;
