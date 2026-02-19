import React, { useState, useEffect } from 'react';
import styles from './ModalPesquisa.module.css';
import { prestadorService } from '../../services/prestadorService';

function ModalPesquisa({ isOpen, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [prestadores, setPrestadores] = useState([]);
    const [filteredPrestadores, setFilteredPrestadores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            carregarPrestadores();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredPrestadores(prestadores);
        } else {
            const filtered = prestadores.filter(p =>
                p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.cpf.includes(searchTerm)
            );
            setFilteredPrestadores(filtered);
        }
    }, [searchTerm, prestadores]);

    const carregarPrestadores = async () => {
        setLoading(true);
        try {
            const data = await prestadorService.listar();
            const prestadoresFormatados = data.map(item => ({
                id: item.cod_prestador,
                nome: item.nome,
                cpf: item.cpf
            }));
            setPrestadores(prestadoresFormatados);
            setFilteredPrestadores(prestadoresFormatados);
        } catch (error) {
            console.error('Erro ao carregar prestadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (prestador) => {
        onSelect(prestador.id);
        onClose();
        setSearchTerm('');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Selecionar Prestador</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <input
                    type="text"
                    className={styles.modalSearchInput}
                    placeholder="Pesquisar por nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className={styles.modalResultsList}>
                    {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredPrestadores.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Nenhum prestador encontrado
                        </p>
                    )}

                    {!loading && filteredPrestadores.map(prestador => (
                        <div
                            key={prestador.id}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(prestador)}
                        >
                            <div className={styles.modalResultNome}>{prestador.nome}</div>
                            <div className={styles.modalResultCpf}>CPF: {prestador.cpf}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModalPesquisa;