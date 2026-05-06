import React from 'react';
import { X } from 'lucide-react';
import styles from './OrcamentosFiltros.module.css';

/**
 * Componente OrcamentosFiltros - Filtros por coluna para tabela profissional
 * 
 * @param {Object} props
 * @param {Object} props.filtros - Objeto com todos os filtros atuais
 * @param {Function} props.onFiltroChange - Callback quando um filtro muda
 * @param {Function} props.onLimparFiltros - Callback para limpar todos os filtros
 * @param {Array} props.usuarios - Lista de usuários para select
 * @param {Array} props.prestadores - Lista de prestadores para select
 * @param {Array} props.empresas - Lista de empresas para select
 * @param {Array} props.tiposPagamento - Lista de tipos de pagamento para select
 */
function OrcamentosFiltros({ 
    filtros, 
    onFiltroChange, 
    onLimparFiltros,
    usuarios = [],
    prestadores = [],
    empresas = [],
    tiposPagamento = []
}) {
    const handleChange = (campo, valor) => {
        onFiltroChange(campo, valor);
    };

    const temFiltrosAtivos = Object.values(filtros).some(v => v !== '' && v !== null && v !== undefined);

    return (
        <div className={styles.filtrosContainer}>
            <div className={styles.filtrosHeader}>
                <h4 className={styles.filtrosTitle}>Filtros Avançados</h4>
                {temFiltrosAtivos && (
                    <button 
                        className={styles.btnLimparFiltros}
                        onClick={onLimparFiltros}
                        title="Limpar todos os filtros"
                    >
                        <X size={16} />
                        Limpar Filtros
                    </button>
                )}
            </div>

            <div className={styles.filtrosGrid}>
                {/* Filtro Movimento - Data Inicial */}
                <div className={styles.filtroGroup}>
                    <label>Movimento (Início)</label>
                    <input
                        type="date"
                        value={filtros.dataInicio || ''}
                        onChange={(e) => handleChange('dataInicio', e.target.value)}
                    />
                </div>

                {/* Filtro Movimento - Data Final */}
                <div className={styles.filtroGroup}>
                    <label>Movimento (Fim)</label>
                    <input
                        type="date"
                        value={filtros.dataFim || ''}
                        onChange={(e) => handleChange('dataFim', e.target.value)}
                    />
                </div>

                {/* Filtro Usuário Criador */}
                <div className={styles.filtroGroup}>
                    <label>Usuário Criador</label>
                    <select
                        value={filtros.usuarioCriadorId || ''}
                        onChange={(e) => handleChange('usuarioCriadorId', e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">Todos</option>
                        {usuarios.map(user => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro Prestador */}
                <div className={styles.filtroGroup}>
                    <label>Prestador</label>
                    <select
                        value={filtros.prestadorId || ''}
                        onChange={(e) => handleChange('prestadorId', e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">Todos</option>
                        {prestadores.map(prest => (
                            <option key={prest.id} value={prest.id}>{prest.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro Empresa */}
                <div className={styles.filtroGroup}>
                    <label>Empresa</label>
                    <select
                        value={filtros.empresaId || ''}
                        onChange={(e) => handleChange('empresaId', e.target.value ? Number(e.target.value) : null)}
                    >
                        <option value="">Todas</option>
                        {empresas.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.nome}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro Descrição */}
                <div className={styles.filtroGroup}>
                    <label>Descrição</label>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={filtros.descricao || ''}
                        onChange={(e) => handleChange('descricao', e.target.value)}
                    />
                </div>

                {/* Filtro Tipo Pagamento */}
                <div className={styles.filtroGroup}>
                    <label>Tipo Pagamento</label>
                    <select
                        value={filtros.tipoPagamento || ''}
                        onChange={(e) => handleChange('tipoPagamento', e.target.value)}
                    >
                        <option value="">Todos</option>
                        {tiposPagamento.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro Valor Mínimo */}
                <div className={styles.filtroGroup}>
                    <label>Valor Mínimo</label>
                    <input
                        type="number"
                        placeholder="0,00"
                        step="0.01"
                        min="0"
                        value={filtros.valorMin || ''}
                        onChange={(e) => handleChange('valorMin', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                </div>

                {/* Filtro Valor Máximo */}
                <div className={styles.filtroGroup}>
                    <label>Valor Máximo</label>
                    <input
                        type="number"
                        placeholder="999999,99"
                        step="0.01"
                        min="0"
                        value={filtros.valorMax || ''}
                        onChange={(e) => handleChange('valorMax', e.target.value ? parseFloat(e.target.value) : null)}
                    />
                </div>
            </div>
        </div>
    );
}

export default OrcamentosFiltros;
