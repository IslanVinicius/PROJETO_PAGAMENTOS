import { api } from './api';

export const dadosBancariosService = {
    async listar() {
        const response = await api.get('/dados-bancarios');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/dados-bancarios/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/dados-bancarios', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/dados-bancarios/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/dados-bancarios/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};