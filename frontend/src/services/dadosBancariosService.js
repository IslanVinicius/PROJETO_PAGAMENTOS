const API_URL = 'http://localhost:8080';

export const dadosBancariosService = {
    // GET /dados-bancarios - listar todos
    async listar() {
        const response = await fetch(`${API_URL}/dados-bancarios`);
        if (!response.ok) throw new Error('Erro ao listar dados bancários');
        return await response.json();
    },

    // GET /dados-bancarios/:id - obter um
    async obter(id) {
        const response = await fetch(`${API_URL}/dados-bancarios/${id}`);
        if (!response.ok) throw new Error('Erro ao obter dados bancários');
        return await response.json();
    },

    // POST /dados-bancarios - criar
    async criar(dados) {
        const response = await fetch(`${API_URL}/dados-bancarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar dados bancários');
        return await response.json();
    },

    // PUT /dados-bancarios/:id - atualizar
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/dados-bancarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar dados bancários');
        return await response.json();
    },

    // DELETE /dados-bancarios/:id - deletar
    async deletar(id) {
        const response = await fetch(`${API_URL}/dados-bancarios/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204) {
            return { success: true };
        }
        if (!response.ok) throw new Error('Erro ao deletar dados bancários');
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};