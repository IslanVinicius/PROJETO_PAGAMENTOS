import React, { useState, useEffect } from 'react';
import styles from './ModalPesquisa.module.css'; // Reutiliza o mesmo CSS
import { empresaService } from '../../services/empresaService';

function ModalPesquisaEmpresa({ isOpen, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [filteredEmpresas, setFilteredEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            carregarEmpresas();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredEmpresas(empresas);
        } else {
            const filtered = empresas.filter(e =>
                e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.cnpj.includes(searchTerm)
            );
            setFilteredEmpresas(filtered);
        }
    }, [searchTerm, empresas]);

    const carregarEmpresas = async () => {
        setLoading(true);
        try {
            const data = await empresaService.listar();
            const empresasFormatadas = data.map(item => ({
                id: item.idEmpresa,
                nome: item.nome,
                cnpj: item.cnpj
            }));
            setEmpresas(empresasFormatadas);
            setFilteredEmpresas(empresasFormatadas);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (empresa) => {
        onSelect(empresa.id);
        onClose();
        setSearchTerm('');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Selecionar Empresa</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <input
                    type="text"
                    className={styles.modalSearchInput}
                    placeholder="Pesquisar por nome ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                <div className={styles.modalResultsList}>
                    {loading && <p style={{ textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredEmpresas.length === 0 && (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Nenhuma empresa encontrada
                        </p>
                    )}

                    {!loading && filteredEmpresas.map(empresa => (
                        <div
                            key={empresa.id}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(empresa)}
                        >
                            <div className={styles.modalResultNome}>{empresa.nome}</div>
                            <div className={styles.modalResultCpf}>CNPJ: {empresa.cnpj}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModalPesquisaEmpresa;