const API_URL = 'http://localhost:8080'; // mesma base da API

export const prestadorService = {
    // GET /prestador - listar todos
    async listar() {
        const response = await fetch(`${API_URL}/prestador`);
        if (!response.ok) throw new Error('Erro ao listar prestadores');
        return await response.json();
    },

    // GET /prestador/:id - obter um
    async obter(id) {
        const response = await fetch(`${API_URL}/prestador/${id}`);
        if (!response.ok) throw new Error('Erro ao obter prestador');
        return await response.json();
    },

    // POST /prestador - criar
    async criar(dados) {
        const response = await fetch(`${API_URL}/prestador`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar prestador');
        return await response.json();
    },

    // PUT /prestador/:id - atualizar
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/prestador/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar prestador');
        return await response.json();
    },

    // DELETE /prestador/:id - deletar
    async deletar(id) {
        const response = await fetch(`${API_URL}/prestador/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204) {
            return { success: true };
        }
        if (!response.ok) throw new Error('Erro ao deletar prestador');
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};