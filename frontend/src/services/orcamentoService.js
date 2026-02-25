import { api } from './api';

export const orcamentoService = {
    async listar() {
        const response = await api.get('/orcamento');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/orcamento/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/orcamento', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/orcamento/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/orcamento/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};