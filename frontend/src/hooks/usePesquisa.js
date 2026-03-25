import { useState, useMemo } from 'react';

/**
 * Hook genérico para pesquisa em formulários
 * @param {Array} dados - Array de dados a serem pesquisados
 * @param {Array} camposPesquisa - Array de objetos { campo: 'nomeCampo', label: 'Label Exibido' }
 * @returns {Object} - Funções e estados para controle da pesquisa
 */
export function usePesquisa(dados, camposPesquisa) {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [campoSelecionado, setCampoSelecionado] = useState(camposPesquisa[0]?.campo || '');
    const [mostrarResultados, setMostrarResultados] = useState(false);

    const resultados = useMemo(() => {
        if (!termoPesquisa.trim()) return [];
        
        const termoLower = termoPesquisa.toLowerCase();
        
        return dados.filter(item => {
            const valor = item[campoSelecionado];
            if (valor === null || valor === undefined) return false;
            
            // Converte para string e pesquisa
            const valorString = String(valor).toLowerCase();
            return valorString.includes(termoLower);
        });
    }, [dados, termoPesquisa, campoSelecionado]);

    const handlePesquisar = () => {
        setMostrarResultados(true);
    };

    const handleLimparPesquisa = () => {
        setTermoPesquisa('');
        setMostrarResultados(false);
    };

    const handleSelecionarResultado = (item, callback) => {
        if (callback) {
            callback(item);
        }
        setMostrarResultados(false);
        setTermoPesquisa('');
    };

    return {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado,
        camposPesquisa
    };
}

export default usePesquisa;
