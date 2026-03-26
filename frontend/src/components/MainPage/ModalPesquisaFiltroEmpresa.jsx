import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import styles from './ModalPesquisa.module.css';
import { empresaService } from '../../services/empresaService';

function ModalPesquisaFiltroEmpresa({ isOpen, onClose, onSelect }) {
    const [filtros, setFiltros] = useState({
        nome: '',
        cnpj: '',
        razao: '',
        id: ''
    });
    const [empresas, setEmpresas] = useState([]);
    const [filteredEmpresas, setFilteredEmpresas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(true);

    useEffect(() => {
        if (isOpen) {
            carregarEmpresas();
        }
    }, [isOpen]);

    useEffect(() => {
        filtrarEmpresas();
    }, [filtros, empresas]);

    const carregarEmpresas = async () => {
        setLoading(true);
        try {
            const data = await empresaService.listar();
            const empresasFormatadas = data.map(item => ({
                id: item.idEmpresa,
                nome: item.nome,
                cnpj: item.cnpj,
                razao: item.razao || ''
            }));
            setEmpresas(empresasFormatadas);
            setFilteredEmpresas(empresasFormatadas);
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarEmpresas = () => {
        let resultado = [...empresas];

        if (filtros.id.trim()) {
            resultado = resultado.filter(e => e.id.toString().includes(filtros.id.trim()));
        }

        if (filtros.nome.trim()) {
            resultado = resultado.filter(e => 
                e.nome.toLowerCase().includes(filtros.nome.toLowerCase())
            );
        }

        if (filtros.cnpj.trim()) {
            resultado = resultado.filter(e => e.cnpj.includes(filtros.cnpj));
        }

        if (filtros.razao.trim()) {
            resultado = resultado.filter(e => 
                e.razao.toLowerCase().includes(filtros.razao.toLowerCase())
            );
        }

        setFilteredEmpresas(resultado);
    };

    const handleInputChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const limparFiltros = () => {
        setFiltros({
            nome: '',
            cnpj: '',
            razao: '',
            id: ''
        });
    };

    const handleSelect = (empresa) => {
        onSelect(empresa);
        onClose();
        limparFiltros();
    };

    const toggleFiltros = () => {
        setMostrarFiltros(!mostrarFiltros);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={`${styles.modalContent} ${styles.modalContentLarge}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Pesquisa de Empresas</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                {/* Botão Toggle para Mostrar/Ocultar Filtros */}
                <div className={styles.filterToggleContainer}>
                    <button 
                        className={styles.toggleButton}
                        onClick={toggleFiltros}
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
                            <div className={styles.filterGroup}>
                                <label>ID</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite o ID"
                                    value={filtros.id}
                                    onChange={(e) => handleInputChange('id', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Nome Fantasia</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite o nome"
                                    value={filtros.nome}
                                    onChange={(e) => handleInputChange('nome', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>CNPJ</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="00.000.000/0000-00"
                                    value={filtros.cnpj}
                                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Razão Social</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite a razão social"
                                    value={filtros.razao}
                                    onChange={(e) => handleInputChange('razao', e.target.value)}
                                />
                            </div>
                        </div>

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
                    </div>
                )}

                {/* Resultados */}
                <div className={styles.modalResultsHeader}>
                    <span>Resultados: {filteredEmpresas.length}</span>
                </div>

                <div className={styles.modalResultsList}>
                    {loading && (
                        <div className={styles.loadingMessage}>
                            <p>Carregando...</p>
                        </div>
                    )}

                    {!loading && filteredEmpresas.length === 0 && (
                        <div className={styles.noResultsMessage}>
                            <p>Nenhuma empresa encontrada</p>
                        </div>
                    )}

                    {!loading && filteredEmpresas.map(empresa => (
                        <div
                            key={empresa.id}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(empresa)}
                        >
                            <div className={styles.resultItemHeader}>
                                <div className={styles.resultItemId}>ID: {empresa.id}</div>
                            </div>
                            <div className={styles.resultItemContent}>
                                <div className={styles.resultItemNome}>{empresa.nome}</div>
                                <div className={styles.resultItemDetails}>
                                    <span>CNPJ: {empresa.cnpj}</span>
                                    {empresa.razao && (
                                        <span className={styles.separator}>•</span>
                                    )}
                                    {empresa.razao && (
                                        <span className={styles.resultItemRazao}>{empresa.razao}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ModalPesquisaFiltroEmpresa;
