const API_URL = 'http://localhost:8080';

export const solicitacaoAprovacaoService = {
    // GET /solicitacao-aprovacao - listar todos
    async listar() {
        const response = await fetch(`${API_URL}/solicitacao-aprovacao`);
        if (!response.ok) throw new Error('Erro ao listar solicitações');
        return await response.json();
    },

    // GET /solicitacao-aprovacao/:id - obter um
    async obter(id) {
        const response = await fetch(`${API_URL}/solicitacao-aprovacao/${id}`);
        if (!response.ok) throw new Error('Erro ao obter solicitação');
        return await response.json();
    },

    // POST /solicitacao-aprovacao - criar
    async criar(dados) {
        const response = await fetch(`${API_URL}/solicitacao-aprovacao`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar solicitação');
        return await response.json();
    },

    // PUT /solicitacao-aprovacao/:id - atualizar
    async atualizar(id, dados) {
        const response = await fetch(`${API_URL}/solicitacao-aprovacao/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao atualizar solicitação');
        return await response.json();
    },

    // DELETE /solicitacao-aprovacao/:id - deletar
    async deletar(id) {
        const response = await fetch(`${API_URL}/solicitacao-aprovacao/${id}`, {
            method: 'DELETE'
        });
        if (response.status === 204) {
            return { success: true };
        }
        if (!response.ok) throw new Error('Erro ao deletar solicitação');
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    }
};