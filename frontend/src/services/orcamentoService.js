import { api } from './api';

const getBaseUrl = () => localStorage.getItem('api_url') || 'http://localhost:8080/api';

// Converte URL relativa para URL absoluta
const toAbsoluteUrl = (url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return getBaseUrl().replace('/api', '') + url;
};

export const orcamentoService = {
    async listar() {
        const response = await api.get('/orcamento');
        const data = await response.json();
        // Converter URLs de imagens para absolutas
        if (Array.isArray(data)) {
            return data.map(item => ({
                ...item,
                imagens: (item.imagens || []).map(img => ({
                    ...img,
                    urlImagem: toAbsoluteUrl(img.urlImagem)
                }))
            }));
        }
        return data;
    },
    async listarDisponiveis() {
            const response = await api.get('/orcamento/disponiveis');
            return await response.json();
        },
    async obter(id) {
        const response = await api.get(`/orcamento/${id}`);
        const data = await response.json();
        // Converter URLs de imagens para absolutas
        if (data && data.imagens) {
            data.imagens = data.imagens.map(img => ({
                ...img,
                urlImagem: toAbsoluteUrl(img.urlImagem)
            }));
        }
        return data;
    },
    async criar(dados) {
        const response = await api.post('/orcamento', dados);
        const data = await response.json();
        // Converter URLs de imagens para absolutas
        if (data && data.imagens) {
            data.imagens = data.imagens.map(img => ({
                ...img,
                urlImagem: toAbsoluteUrl(img.urlImagem)
            }));
        }
        return data;
    },
    async atualizar(id, dados) {
        const response = await api.put(`/orcamento/${id}`, dados);
        const data = await response.json();
        // Converter URLs de imagens para absolutas
        if (data && data.imagens) {
            data.imagens = data.imagens.map(img => ({
                ...img,
                urlImagem: toAbsoluteUrl(img.urlImagem)
            }));
        }
        return data;
    },
    async deletar(id) {
        const response = await api.delete(`/orcamento/${id}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },
    // Métodos para upload de imagens
    async uploadImagem(orcamentoId, arquivo) {
        const formData = new FormData();
        formData.append('file', arquivo);
        
        const baseUrl = getBaseUrl();
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${baseUrl}/orcamento/${orcamentoId}/imagens`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Erro ${response.status}`;
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorText;
                } catch {
                    errorMessage = errorText;
                }
            }
            throw new Error(errorMessage || 'Erro ao fazer upload da imagem');
        }
        
        const responseText = await response.text();
        if (!responseText) {
            throw new Error('Resposta vazia do servidor');
        }
        const data = JSON.parse(responseText);
        // Converter URL para absoluta
        if (data && data.urlImagem) {
            data.urlImagem = toAbsoluteUrl(data.urlImagem);
        }
        return data;
    },
    async listarImagens(orcamentoId) {
        const response = await api.get(`/orcamento/${orcamentoId}/imagens`);
        const data = await response.json();
        // Converter URLs para absolutas
        if (Array.isArray(data)) {
            return data.map(img => ({
                ...img,
                urlImagem: toAbsoluteUrl(img.urlImagem)
            }));
        }
        return data;
    },
    async deletarImagem(orcamentoId, imagemId) {
        const response = await api.delete(`/orcamento/${orcamentoId}/imagens/${imagemId}`);
        if (response.status === 204) return { success: true };
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    },
    // Método para gerar PDF
    async gerarPdf(orcamentoId) {
        const baseUrl = getBaseUrl();
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${baseUrl}/orcamento/${orcamentoId}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage = `Erro ${response.status}`;
            if (errorText) {
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorText;
                } catch {
                    errorMessage = errorText;
                }
            }
            throw new Error(errorMessage || 'Erro ao gerar PDF');
        }
        
        // Retornar o blob do PDF
        return await response.blob();
    }
};