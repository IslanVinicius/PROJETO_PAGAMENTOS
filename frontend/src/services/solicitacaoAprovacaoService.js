import { api } from './api';

export const solicitacaoAprovacaoService = {
    async listar() {
        const response = await api.get('/solicitacao-aprovacao');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/solicitacao-aprovacao/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/solicitacao-aprovacao', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/solicitacao-aprovacao/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/solicitacao-aprovacao/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};