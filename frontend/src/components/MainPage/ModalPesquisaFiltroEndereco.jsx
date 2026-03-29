import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';
import styles from './ModalPesquisa.module.css';
import { enderecoService } from '../../services/enderecoService';

function ModalPesquisaFiltroEndereco({ isOpen, onClose, onSelect }) {
    const [filtros, setFiltros] = useState({
        id: '',
        cep: '',
        logradouro: '',
        bairro: '',
        cidade: '',
        empresa: ''
    });
    const [enderecos, setEnderecos] = useState([]);
    const [filteredEnderecos, setFilteredEnderecos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mostrarFiltros, setMostrarFiltros] = useState(true);

    useEffect(() => {
        if (isOpen) {
            carregarEnderecos();
        }
    }, [isOpen]);

    useEffect(() => {
        filtrarEnderecos();
    }, [filtros, enderecos]);

    const carregarEnderecos = async () => {
        setLoading(true);
        try {
            const data = await enderecoService.listar();
            const enderecosFormatados = data.map(item => ({
                id: item.idEndereco,
                cep: item.cep || '',
                logradouro: item.logradouro || '',
                numero: item.numero || '',
                complemento: item.complemento || '',
                bairro: item.bairro || '',
                cidade: item.cidade || '',
                estado: item.estado || '',
                idEmpresa: item.idEmpresa,
                nomeEmpresa: item.nomeEmpresa || ''
            }));
            setEnderecos(enderecosFormatados);
            setFilteredEnderecos(enderecosFormatados);
        } catch (error) {
            console.error('Erro ao carregar endereços:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarEnderecos = () => {
        let resultado = [...enderecos];

        if (filtros.id.trim()) {
            resultado = resultado.filter(e =>
                e.id.toString().includes(filtros.id.trim())
            );
        }

        if (filtros.cep.trim()) {
            resultado = resultado.filter(e =>
                e.cep.replace(/\D/g, '').includes(filtros.cep.replace(/\D/g, ''))
            );
        }

        if (filtros.logradouro.trim()) {
            resultado = resultado.filter(e =>
                e.logradouro.toLowerCase().includes(filtros.logradouro.toLowerCase())
            );
        }

        if (filtros.bairro.trim()) {
            resultado = resultado.filter(e =>
                e.bairro.toLowerCase().includes(filtros.bairro.toLowerCase())
            );
        }

        if (filtros.cidade.trim()) {
            resultado = resultado.filter(e =>
                e.cidade.toLowerCase().includes(filtros.cidade.toLowerCase())
            );
        }

        if (filtros.empresa.trim()) {
            resultado = resultado.filter(e =>
                e.nomeEmpresa.toLowerCase().includes(filtros.empresa.toLowerCase())
            );
        }

        setFilteredEnderecos(resultado);
    };

    const handleInputChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const limparFiltros = () => {
        setFiltros({ id: '', cep: '', logradouro: '', bairro: '', cidade: '', empresa: '' });
    };

    const handleSelect = (endereco) => {
        onSelect(endereco);
        onClose();
        limparFiltros();
    };

    const toggleFiltros = () => {
        setMostrarFiltros(prev => !prev);
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={`${styles.modalContent} ${styles.modalContentLarge}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3>Pesquisa de Endereços</h3>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

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
                                <label>CEP</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="00000-000"
                                    value={filtros.cep}
                                    onChange={(e) => handleInputChange('cep', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Logradouro</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite o logradouro"
                                    value={filtros.logradouro}
                                    onChange={(e) => handleInputChange('logradouro', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Bairro</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite o bairro"
                                    value={filtros.bairro}
                                    onChange={(e) => handleInputChange('bairro', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Cidade</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite a cidade"
                                    value={filtros.cidade}
                                    onChange={(e) => handleInputChange('cidade', e.target.value)}
                                />
                            </div>

                            <div className={styles.filterGroup}>
                                <label>Empresa</label>
                                <input
                                    type="text"
                                    className={styles.filterInput}
                                    placeholder="Digite o nome da empresa"
                                    value={filtros.empresa}
                                    onChange={(e) => handleInputChange('empresa', e.target.value)}
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

                <div className={styles.modalResultsHeader}>
                    <span>Resultados: {filteredEnderecos.length}</span>
                </div>

                <div className={styles.modalResultsList}>
                    {loading && (
                        <div className={styles.loadingMessage}>
                            <p>Carregando...</p>
                        </div>
                    )}

                    {!loading && filteredEnderecos.length === 0 && (
                        <div className={styles.noResultsMessage}>
                            <p>Nenhum endereço encontrado</p>
                        </div>
                    )}

                    {!loading && filteredEnderecos.map(endereco => (
                        <div
                            key={endereco.id}
                            className={styles.modalResultItem}
                            onClick={() => handleSelect(endereco)}
                        >
                            <div className={styles.resultItemHeader}>
                                <div className={styles.resultItemId}>ID: {endereco.id}</div>
                            </div>
                            <div className={styles.resultItemContent}>
                                <div className={styles.resultItemNome}>
                                    {endereco.logradouro}{endereco.numero ? `, ${endereco.numero}` : ''}
                                </div>
                                <div className={styles.resultItemDetails}>
                                    <span>CEP: {endereco.cep}</span>
                                    {endereco.bairro && (
                                        <>
                                            <span className={styles.separator}>•</span>
                                            <span>{endereco.bairro}</span>
                                        </>
                                    )}
                                    {endereco.cidade && (
                                        <>
                                            <span className={styles.separator}>•</span>
                                            <span>{endereco.cidade}/{endereco.estado}</span>
                                        </>
                                    )}
                                    {endereco.nomeEmpresa && (
                                        <>
                                            <span className={styles.separator}>•</span>
                                            <span className={styles.resultItemRazao}>{endereco.nomeEmpresa}</span>
                                        </>
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

export default ModalPesquisaFiltroEndereco;
