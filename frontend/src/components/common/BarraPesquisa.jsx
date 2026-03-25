import React from 'react';
import { Search, X } from 'lucide-react';
import styles from './BarraPesquisa.module.css';

/**
 * Componente de barra de pesquisa genérica para formulários
 * @param {Object} props
 * @param {string} props.termo - Termo de pesquisa atual
 * @param {function} props.onTermoChange - Callback quando o termo muda
 * @param {string} props.campoSelecionado - Campo atualmente selecionado
 * @param {function} props.onCampoChange - Callback quando o campo muda
 * @param {Array} props.campos - Array de { campo, label } para o select
 * @param {function} props.onPesquisar - Callback ao clicar em pesquisar
 * @param {function} props.onLimpar - Callback ao clicar em limpar
 * @param {boolean} props.desabilitado - Se a barra está desabilitada
 */
export function BarraPesquisa({
    termo,
    onTermoChange,
    campoSelecionado,
    onCampoChange,
    campos = [],
    onPesquisar,
    onLimpar,
    desabilitado = false
}) {
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onPesquisar();
        }
    };

    return (
        <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
                <select
                    className={styles.campoSelect}
                    value={campoSelecionado}
                    onChange={(e) => onCampoChange(e.target.value)}
                    disabled={desabilitado}
                >
                    {campos.map((campo) => (
                        <option key={campo.campo} value={campo.campo}>
                            {campo.label}
                        </option>
                    ))}
                </select>
                
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={`Pesquisar por ${campos.find(c => c.campo === campoSelecionado)?.label || '...'}`}
                    value={termo}
                    onChange={(e) => onTermoChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={desabilitado}
                />
                
                <button
                    className={styles.searchButton}
                    onClick={onPesquisar}
                    disabled={desabilitado || !termo.trim()}
                    type="button"
                >
                    <Search size={18} />
                    <span>Pesquisar</span>
                </button>
                
                {termo && (
                    <button
                        className={styles.limparButton}
                        onClick={onLimpar}
                        disabled={desabilitado}
                        type="button"
                        title="Limpar pesquisa"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default BarraPesquisa;
