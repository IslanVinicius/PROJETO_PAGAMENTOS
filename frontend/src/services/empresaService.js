import { api } from './api';

export const empresaService = {
    async listar() {
        const response = await api.get('/empresa');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/empresa/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/empresa', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/empresa/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/empresa/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};