// Defina a URL base da sua API
const API_URL = 'http://localhost:8080'; // ajuste conforme necessário

export const empresaService = {
    // GET /empresa - listar todas
    async listar() {
        const response = await fetch(`${API_URL}/empresa`);
        if (!response.ok) throw new Error('Erro ao listar empresas');
        return await response.json();
    },

    // GET /empresa/:id - obter uma
    async obter(id) {
        const response = await fetch(`${API_URL}/empresa/${id}`);
        if (!response.ok) throw new Error('Erro ao obter empresa');
        return await response.json();
    },

    // POST /empresa - criar
    async criar(dados) {
        const response = await fetch(`${API_URL}/empresa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar empresa');
        return await response.json();
    },

    // PUT /empresa/:id - atualizar
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/empresa/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar empresa');
        return await response.json();
    },

    // DELETE /empresa/:id - deletar
    async deletar(id) {
        const response = await fetch(`${API_URL}/empresa/${id}`, {
            method: 'DELETE'
        });

        // Se a resposta for 204 (No Content), retorna sucesso sem JSON
        if (response.status === 204) {
            return { success: true };
        }

        if (!response.ok) {
            throw new Error('Erro ao deletar empresa');
        }

        // Tenta ler o corpo da resposta (pode ser JSON ou vazio)
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};