const API_URL = 'http://localhost:8080';

export const orcamentoService = {
    // GET /orcamento - listar todos
    async listar() {
        const response = await fetch(`${API_URL}/orcamento`);
        if (!response.ok) throw new Error('Erro ao listar orçamentos');
        return await response.json();
    },

    // GET /orcamento/:id - obter um
    async obter(id) {
        const response = await fetch(`${API_URL}/orcamento/${id}`);
        if (!response.ok) throw new Error('Erro ao obter orçamento');
        return await response.json();
    },

    // POST /orcamento - criar
    async criar(dados) {
        const response = await fetch(`${API_URL}/orcamento`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar orçamento');
        return await response.json();
    },

    // PUT /orcamento/:id - atualizar
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/orcamento/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar orçamento');
        return await response.json();
    },

    // DELETE /orcamento/:id - deletar
    async deletar(id) {
        const response = await fetch(`${API_URL}/orcamento/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204) {
            return { success: true };
        }
        if (!response.ok) throw new Error('Erro ao deletar orçamento');
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};