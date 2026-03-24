import { api } from './api';

export const itemService = {
    async listar() {
        const response = await api.get('/itens');
        return await response.json();
    },
    async obter(id) {
        const response = await api.get(`/itens/${id}`);
        return await response.json();
    },
    async listarPorGrupo(idGrupo) {
        const response = await api.get(`/itens/grupo/${idGrupo}`);
        return await response.json();
    },
    async criar(dados) {
        const response = await api.post('/itens', dados);
        return await response.json();
    },
    async atualizar(id, dados) {
        const response = await api.put(`/itens/${id}`, dados);
        return await response.json();
    },
    async deletar(id) {
        const response = await api.delete(`/itens/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },
    async buscarPorNome(nome) {
        const response = await api.get(`/itens/buscar?nome=${encodeURIComponent(nome)}`);
        return await response.json();
    }
};
