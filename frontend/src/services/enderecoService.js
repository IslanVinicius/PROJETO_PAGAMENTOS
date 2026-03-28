import { api } from './api';

export const enderecoService = {
    async listar() {
        const response = await api.get('/enderecos');
        return await response.json();
    },

    async listarPorEmpresa(idEmpresa) {
        const response = await api.get(`/enderecos/empresa/${idEmpresa}`);
        return await response.json();
    },

    async obter(id) {
        const response = await api.get(`/enderecos/${id}`);
        return await response.json();
    },

    async criar(dados) {
        const response = await api.post('/enderecos', dados);
        return await response.json();
    },

    async atualizar(id, dados) {
        const response = await api.put(`/enderecos/${id}`, dados);
        return await response.json();
    },

    async deletar(id) {
        const response = await api.delete(`/enderecos/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },

    async buscarViaIA(cep, idEmpresa) {
        const response = await api.post(`/enderecos/ia/${cep}/empresa/${idEmpresa}`);
        return await response.json();
    }
};
