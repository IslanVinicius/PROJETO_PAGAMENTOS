import React, { useState, useEffect } from 'react';
import styles from './ModalPesquisa.module.css';
import { itemService } from '../../services/itemService';

function ModalPesquisaItens({ isOpen, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [itens, setItens] = useState([]);
    const [filteredItens, setFilteredItens] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            carregarItens();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredItens(itens);
        } else {
            const filtered = itens.filter(item =>
                item.nome.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredItens(filtered);
        }
    }, [searchTerm, itens]);

    const carregarItens = async () => {
        setLoading(true);
        try {
            const data = await itemService.listar();
            const itensFormatados = data.map(item => ({
                id: item.idItem,
                nome: item.nome,
                descricao: item.descricao,
                valorUnitario: item.valorUnitario
            }));
            setItens(itensFormatados);
            setFilteredItens(itensFormatados);
        } catch (error) {
            console.error('Erro ao carregar itens:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item) => {
        onSelect(item);
        onClose();
        setSearchTerm('');
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Selecionar Item</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <input
                    type="text"
                    className={styles.modalSearchInput}
                    placeholder="Pesquisar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className={styles.modalResultsList}>
                    {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredItens.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Nenhum item encontrado
                        </p>
                    )}

                    {!loading && filteredItens.map(item => (
                        <div
                            key={item.id}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(item)}
                        >
                            <div className={styles.modalResultNome}>{item.nome}</div>
                            <div className={styles.modalResultCpf}>
                                {item.descricao || 'Sem descrição'} | Valor: {formatarValor(item.valorUnitario)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModalPesquisaItens;
