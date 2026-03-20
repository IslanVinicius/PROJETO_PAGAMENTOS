import React, { useState, useEffect } from 'react';
import styles from './FormularioTemplate.module.css';
import { empresaService } from '../../services/empresaService';

function EmpresaCadastro() {
    const [registros, setRegistros] = useState([]);
    const [selecionado, setSelecionado] = useState(null);
    const [modo, setModo] = useState('view'); // view, edit, create
    const [form, setForm] = useState({ nome: '', cnpj: '', razao: '' });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        carregar();
    }, []);

    const carregar = async () => {
        setLoading(true);
        try {
            const data = await empresaService.listar();
            setRegistros(data || []);
            if (data?.length > 0) setSelecionado(data[0]);
        } catch (error) {
            setMsg('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.nome?.trim() || !form.cnpj?.trim()) {
            setMsg('❌ Preencha Nome e CNPJ');
            return;
        }
        setLoading(true);
        try {
            if (modo === 'edit') {
                await empresaService.atualizar(selecionado.idEmpresa, form);
                setMsg('✅ Atualizado com sucesso!');
            } else {
                const novo = await empresaService.criar(form);
                setMsg('✅ Criado com sucesso!');
                setSelecionado(novo);
            }
            carregar();
            setModo('view');
        } catch (error) {
            setMsg('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Confirmar exclusão?')) return;
        setLoading(true);
        try {
            await empresaService.deletar(selecionado.idEmpresa);
            setMsg('✅ Deletado com sucesso!');
            carregar();
            setSelecionado(null);
        } catch (error) {
            setMsg('❌ ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const filtrados = registros.filter(r =>
        r.nome.toLowerCase().includes(search.toLowerCase()) ||
        r.cnpj.includes(search)
    );

    return (
        <div className={styles.page}>
            {/* HEADER */}
            <div className={styles.header}>
                <h1>🏢 Empresas</h1>
                <button className={styles.btnCreate} onClick={() => { setModo('create'); setForm({ nome: '', cnpj: '', razao: '' }); setSelecionado(null); }}>
                    ➕ Novo
                </button>
            </div>

            {/* MAIN AREA */}
            <div className={styles.content}>
                {/* LEFT - LISTA */}
                <div className={styles.left}>
                    <input
                        type="text"
                        placeholder="🔍 Pesquisar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.search}
                    />
                    <div className={styles.list}>
                        {filtrados.length === 0 ? (
                            <p className={styles.empty}>Nenhum resultado</p>
                        ) : (
                            filtrados.map(r => (
                                <div
                                    key={r.idEmpresa}
                                    className={`${styles.item} ${selecionado?.idEmpresa === r.idEmpresa ? styles.active : ''}`}
                                    onClick={() => { setSelecionado(r); setForm(r); setModo('view'); }}
                                >
                                    <div className={styles.itemName}>{r.nome}</div>
                                    <div className={styles.itemSub}>{r.cnpj}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT - DETAIL */}
                <div className={styles.right}>
                    {selecionado || modo === 'create' ? (
                        <div className={styles.card}>
                            <h2>{modo === 'create' ? '✏️ Nova Empresa' : modo === 'edit' ? '✏️ Editar' : '📄 Detalhes'}</h2>
                            {msg && <div className={`${styles.msg} ${msg.includes('✅') ? styles.success : styles.error}`}>{msg}</div>}

                            <div className={styles.form}>
                                {selecionado && <div className={styles.field}>
                                    <label>ID</label>
                                    <input type="text" value={selecionado.idEmpresa} disabled />
                                </div>}

                                <div className={styles.field}>
                                    <label>Nome *</label>
                                    <input
                                        type="text"
                                        value={form.nome}
                                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                        disabled={modo === 'view'}
                                        placeholder="Digite o nome"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>CNPJ *</label>
                                    <input
                                        type="text"
                                        value={form.cnpj}
                                        onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                                        disabled={modo === 'view'}
                                        placeholder="00.000.000/0000-00"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>Razão Social</label>
                                    <input
                                        type="text"
                                        value={form.razao || ''}
                                        onChange={(e) => setForm({ ...form, razao: e.target.value })}
                                        disabled={modo === 'view'}
                                        placeholder="Digite a razão social"
                                    />
                                </div>
                            </div>

                            <div className={styles.actions}>
                                {modo === 'view' ? (
                                    <>
                                        <button className={styles.btnEdit} onClick={() => setModo('edit')}>✏️ Editar</button>
                                        <button className={styles.btnDelete} onClick={handleDelete}>🗑️ Deletar</button>
                                    </>
                                ) : (
                                    <>
                                        <button className={styles.btnSave} onClick={handleSave} disabled={loading}>💾 Salvar</button>
                                        <button className={styles.btnCancel} onClick={() => { setModo('view'); setForm(selecionado || {}); }}>❌ Cancelar</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <p>Selecione uma empresa</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EmpresaCadastro;

