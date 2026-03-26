import React, { useMemo, useState } from 'react';
import { Filter, X } from 'lucide-react';
import styles from './ModalPesquisa.module.css';
import { BarraPesquisa, ResultadosPesquisa } from '../common';

// Modal genérico para pesquisa com filtros e lista de resultados
// Alinha o visual ao modal de Pesquisa de Empresas (ModalPesquisaFiltroEmpresa)
function ModalPesquisaComum({
  isOpen,
  onClose,
  titulo = 'Pesquisa',
  // Controles do hook/usePesquisa vindos do formulário (modo simples)
  termo,
  onTermoChange,
  campoSelecionado,
  onCampoChange,
  campos = [],
  onPesquisar,
  onLimpar,
  resultados = [],
  mostrarResultados,
  onSelecionar,
  colunas,
  // Novo: permite filtrar por várias colunas simultaneamente (igual modal de Empresa)
  multiFiltro = false,
  dados = []
}) {
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [filtros, setFiltros] = useState(() => {
    const obj = {};
    (campos || []).forEach(c => { obj[c.campo] = ''; });
    return obj;
  });

  const limparFiltros = () => {
    const obj = {};
    (campos || []).forEach(c => { obj[c.campo] = ''; });
    setFiltros(obj);
  };

  const resultadosMulti = useMemo(() => {
    if (!multiFiltro) return resultados;
    if (!Array.isArray(dados)) return [];

    // Se nenhum filtro preenchido, retorna todos
    const algumPreenchido = Object.values(filtros).some(v => String(v || '').trim() !== '');
    if (!algumPreenchido) return dados;

    return dados.filter(item => {
      return Object.entries(filtros).every(([campo, valor]) => {
        const v = String(valor || '').trim();
        if (!v) return true; // ignora campos vazios
        const base = item[campo];
        if (base === undefined || base === null) return false;
        return String(base).toLowerCase().includes(v.toLowerCase());
      });
    });
  }, [multiFiltro, dados, filtros, resultados]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{titulo}</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {/* Botão Toggle para Mostrar/Ocultar Filtros - mesmo padrão do modal de Empresa */}
        <div className={styles.filterToggleContainer}>
          <button
            className={styles.toggleButton}
            onClick={() => setMostrarFiltros((v) => !v)}
            type="button"
          >
            <Filter size={18} />
            <span>{mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
          </button>
        </div>

        {/* Área de Filtros */}
        {mostrarFiltros && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersGrid}>
              {multiFiltro ? (
                // Renderiza um input por coluna permitindo múltiplos filtros simultâneos
                (campos || []).map(c => (
                  <div key={c.campo} className={styles.filterGroup}>
                    <label>{c.label}</label>
                    <input
                      type="text"
                      className={styles.filterInput}
                      value={filtros[c.campo]}
                      onChange={(e) => setFiltros(prev => ({ ...prev, [c.campo]: e.target.value }))}
                      placeholder={`Digite ${c.label.toLowerCase()}`}
                    />
                  </div>
                ))
              ) : (
                <BarraPesquisa
                  termo={termo}
                  onTermoChange={onTermoChange}
                  campoSelecionado={campoSelecionado}
                  onCampoChange={onCampoChange}
                  campos={campos}
                  onPesquisar={onPesquisar}
                  onLimpar={onLimpar}
                  desabilitado={false}
                />
              )}
            </div>

            {multiFiltro && (
              <div className={styles.filterActions}>
                <button
                  className={styles.limparFiltrosButton}
                  onClick={limparFiltros}
                  type="button"
                >
                  <X size={16} />
                  <span>Limpar Filtros</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Header de resultados exibindo a contagem */}
        <div className={styles.modalResultsHeader}>
          <span>Resultados: {Array.isArray(multiFiltro ? resultadosMulti : resultados) ? (multiFiltro ? resultadosMulti.length : resultados.length) : 0}</span>
        </div>

        {/* Lista/grade de resultados */}
        <div className={styles.modalResultsList}>
          <ResultadosPesquisa
            resultados={multiFiltro ? resultadosMulti : resultados}
            mostrar={multiFiltro ? true : mostrarResultados}
            onSelecionar={onSelecionar}
            colunas={colunas}
          />
        </div>
      </div>
    </div>
  );
}

export default ModalPesquisaComum;
