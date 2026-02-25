import { api } from './api';

export const prestadorService = {
    async listar() {
        const response = await api.get('/prestador');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/prestador/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/prestador', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/prestador/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/prestador/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};