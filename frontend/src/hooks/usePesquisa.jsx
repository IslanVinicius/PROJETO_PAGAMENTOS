import { useState, useMemo } from 'react';

/**
 * Hook personalizado para gerenciar pesquisa em listas
 * @param {Array} data - Lista de dados para pesquisar
 * @param {Array} campos - Configuração dos campos pesquisáveis
 * @returns {Object} - Estado e funções para controle da pesquisa
 */
export function usePesquisa(data, campos) {
    const [termoPesquisa, setTermoPesquisa] = useState('');
    const [campoSelecionado, setCampoSelecionado] = useState(campos[0]?.campo || '');
    const [resultados, setResultados] = useState([]);
    const [mostrarResultados, setMostrarResultados] = useState(false);

    // Função para filtrar os dados com base no termo e campo selecionado
    const filtrarDados = (termo, campo) => {
        if (!termo.trim()) {
            return [];
        }

        const termoNormalizado = termo.toLowerCase().trim();

        return data.filter(item => {
            const valorCampo = item[campo];
            
            if (valorCampo === null || valorCampo === undefined) {
                return false;
            }

            const valorString = String(valorCampo).toLowerCase();
            return valorString.includes(termoNormalizado);
        });
    };

    // Memoizar os resultados para evitar recalculos desnecessários
    const resultadosMemo = useMemo(() => {
        return filtrarDados(termoPesquisa, campoSelecionado);
    }, [termoPesquisa, campoSelecionado, data]);

    // Handler para pesquisar
    const handlePesquisar = () => {
        const resultadosFiltrados = filtrarDados(termoPesquisa, campoSelecionado);
        setResultados(resultadosFiltrados);
        setMostrarResultados(true);
    };

    // Handler para limpar pesquisa
    const handleLimparPesquisa = () => {
        setTermoPesquisa('');
        setResultados([]);
        setMostrarResultados(false);
    };

    // Handler para selecionar um resultado
    const handleSelecionarResultado = (item) => {
        setTermoPesquisa('');
        setResultados([]);
        setMostrarResultados(false);
    };

    return {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados: resultadosMemo,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado
    };
}
