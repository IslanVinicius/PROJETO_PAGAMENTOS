import React, { useState, useEffect } from 'react';
import styles from './FormularioSimples.module.css';
import { empresaService } from '../../services/empresaService';

function EmpresaCadastroSimples() {
    const [empresas, setEmpresas] = useState([]);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nome: '', cnpj: '', razao: '' });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        carregarEmpresas();
    }, []);

    const carregarEmpresas = async () => {
        setLoading(true);
        try {
            const data = await empresaService.listar();
            setEmpresas(data || []);
            if (data?.length > 0) setSelectedEmpresa(data[0]);
        } catch (error) {
            setMessage('❌ Erro ao carregar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (empresa) => {
        setSelectedEmpresa(empresa);
        setFormData(empresa);
        setIsEditing(false);
        setMessage('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formData.nome || !formData.cnpj) {
            setMessage('❌ Preencha Nome e CNPJ');
            return;
        }

        setLoading(true);
        try {
            if (selectedEmpresa?.idEmpresa) {
                await empresaService.atualizar(selectedEmpresa.idEmpresa, formData);
                setMessage('✅ Empresa atualizada com sucesso!');
                carregarEmpresas();
            } else {
                const nova = await empresaService.criar(formData);
                setMessage('✅ Empresa criada com sucesso!');
                carregarEmpresas();
                setSelectedEmpresa(nova);
            }
            setIsEditing(false);
        } catch (error) {
            setMessage('❌ Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Excluir esta empresa?')) return;

        setLoading(true);
        try {
            await empresaService.deletar(selectedEmpresa.idEmpresa);
            setMessage('✅ Empresa excluída!');
            carregarEmpresas();
            setSelectedEmpresa(null);
            setIsEditing(false);
        } catch (error) {
            setMessage('❌ Erro: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const empresasFiltradas = empresas.filter(e =>
        e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.cnpj.includes(searchTerm)
    );

    return (
        <div className={styles.container}>
            {/* LADO ESQUERDO - LISTA EM TABELA */}
            <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>📋 Empresas ({empresas.length})</h3>
                    <button
                        className={styles.btnNewSmall}
                        onClick={() => {
                            setSelectedEmpresa(null);
                            setFormData({ nome: '', cnpj: '', razao: '' });
                            setIsEditing(true);
                        }}
                    >
                        ➕
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="🔍 Pesquisar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CNPJ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empresasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className={styles.emptyMessage}>Nenhuma empresa</td>
                                </tr>
                            ) : (
                                empresasFiltradas.map(empresa => (
                                    <tr
                                        key={empresa.idEmpresa}
                                        className={`${styles.tableRow} ${selectedEmpresa?.idEmpresa === empresa.idEmpresa ? styles.active : ''}`}
                                        onClick={() => handleSelect(empresa)}
                                    >
                                        <td className={styles.nameCel}>{empresa.nome}</td>
                                        <td className={styles.cnpjCell}>{empresa.cnpj}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LADO DIREITO - DETALHES */}
            <div className={styles.mainContent}>
                {selectedEmpresa ? (
                    <div className={styles.detailsCard}>
                        <div className={styles.header}>
                            <h2>🏢 {isEditing ? 'Editar Empresa' : 'Detalhes da Empresa'}</h2>
                        </div>

                        {message && <div className={`${styles.message} ${message.includes('❌') ? styles.error : styles.success}`}>{message}</div>}

                        <div className={styles.content}>
                            <div className={styles.formGroup}>
                                <label>ID:</label>
                                <input type="text" value={selectedEmpresa.idEmpresa} disabled />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Nome *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Digite o nome"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>CNPJ *</label>
                                <input
                                    type="text"
                                    name="cnpj"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Razão Social</label>
                                <input
                                    type="text"
                                    name="razao"
                                    value={formData.razao || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Digite a razão social"
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            {!isEditing ? (
                                <>
                                    <button className={styles.btnEdit} onClick={() => setIsEditing(true)}>✏️ Editar</button>
                                    <button className={styles.btnDelete} onClick={handleDelete}>🗑️ Deletar</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.btnSave} onClick={handleSave} disabled={loading}>💾 Salvar</button>
                                    <button className={styles.btnCancel} onClick={() => {
                                        setIsEditing(false);
                                        if (selectedEmpresa) setFormData(selectedEmpresa);
                                    }}>❌ Cancelar</button>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyCard}>
                        <h3>Selecione uma empresa ou crie uma nova</h3>
                        <button className={styles.btnNew} onClick={() => {
                            setFormData({ nome: '', cnpj: '', razao: '' });
                            setIsEditing(true);
                        }}>➕ Criar Nova Empresa</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmpresaCadastroSimples;

