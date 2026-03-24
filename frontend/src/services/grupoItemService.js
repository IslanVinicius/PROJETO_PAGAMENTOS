import { api } from './api';

export const grupoItemService = {
    async listar() {
        const response = await api.get('/grupo-itens');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/grupo-itens/${id}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/grupo-itens', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/grupo-itens/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/grupo-itens/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },
    async buscarPorNome(nome) {
        const response = await api.get(`/grupo-itens/buscar?nome=${encodeURIComponent(nome)}`);
        return await response.json();
    }
};
