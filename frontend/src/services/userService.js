import { api } from './api';

export const userService = {
    // GET /users - listar todos
    async listar() {
        const response = await api.get('/auth');
        return await response.json();
    },

    // GET /users/:id - obter um
    async obter(id) {
        const response = await api.get(`/auth/${id}`);
        return await response.json();
    },

    // POST /users - criar
    async criar(dados) {
        const response = await api.post('/auth/register', dados);
        return await response.json();
    },

    // PUT /users/:id - atualizar
    async atualizar(id, dados) {
        const response = await api.put(`/auth/${id}`, dados);
        return await response.json();
    },

    // DELETE /users/:id - deletar
    async deletar(id) {
        const response = await api.delete(`/auth/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};