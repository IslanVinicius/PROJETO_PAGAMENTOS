import React, { useState, useEffect } from 'react';
import styles from './ModalPesquisa.module.css'; // Reutiliza o mesmo CSS
import { orcamentoService } from '../../services/orcamentoService';

function ModalPesquisaOrcamento({ isOpen, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [orcamentos, setOrcamentos] = useState([]);
    const [filteredOrcamentos, setFilteredOrcamentos] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            carregarOrcamentos();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOrcamentos(orcamentos);
        } else {
            const filtered = orcamentos.filter(o =>
                o.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.orcamentoID.toString().includes(searchTerm) ||
                o.movimento.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredOrcamentos(filtered);
        }
    }, [searchTerm, orcamentos]);

    const carregarOrcamentos = async () => {
        setLoading(true);
        try {
            const data = await orcamentoService.listar();
            const orcamentosFormatados = data.map(item => ({
                orcamentoID: item.orcamentoID,
                descricao: item.descricao,
                movimento: item.movimento,
                valor: item.valor,
                idPrestador: item.idPrestador,
                empresaID: item.empresaID
            }));
            setOrcamentos(orcamentosFormatados);
            setFilteredOrcamentos(orcamentosFormatados);
        } catch (error) {
            console.error('Erro ao carregar orçamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatarValor = (value) => {
        const numero = parseFloat(value);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleSelect = (orcamento) => {
        onSelect(orcamento.orcamentoID);
        onClose();
        setSearchTerm('');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Selecionar Orçamento</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <input
                    type="text"
                    className={styles.modalSearchInput}
                    placeholder="Pesquisar por ID, descrição ou movimento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className={styles.modalResultsList}>
                    {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredOrcamentos.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Nenhum orçamento encontrado
                        </p>
                    )}

                    {!loading && filteredOrcamentos.map(orcamento => (
                        <div
                            key={orcamento.orcamentoID}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(orcamento)}
                        >
                            <div className={styles.modalResultNome}>
                                Orçamento #{orcamento.orcamentoID} - {orcamento.descricao}
                            </div>
                            <div className={styles.modalResultCpf}>
                                Data: {orcamento.movimento} | Valor: {formatarValor(orcamento.valor)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModalPesquisaOrcamento;