/**
 * Formatadores para uso geral no frontend
 */

export const formatadores = {
    moeda: (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },

    data: (data) => {
        if (!data) return '';
        return new Date(data).toLocaleDateString('pt-BR');
    },

    dataHora: (data) => {
        if (!data) return '';
        return new Date(data).toLocaleString('pt-BR');
    },

    cnpj: (cnpj) => {
        if (!cnpj) return '';
        return cnpj
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    },

    cpf: (cpf) => {
        if (!cpf) return '';
        return cpf
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    }
};
