import React, { useState, useEffect } from 'react';
import { FormLayout, FormGroup, FormField, FormSelect, FormRow } from '../../Shared/FormLayout';
import { dadosBancariosService } from '../../services/dadosBancariosService';
import { prestadorService } from '../../services/prestadorService';
import styles from './DadosBancariosCadastro.module.css';

function DadosBancariosCadastroModerno() {
    const [dadosId, setDadosId] = useState('');
    const [codPrestador, setCodPrestador] = useState('');
    const [banco, setBanco] = useState('');
    const [tipoConta, setTipoConta] = useState('');
    const [agencia, setAgencia] = useState('');
    const [conta, setConta] = useState('');
    const [chavePix, setChavePix] = useState('');

    const [registros, setRegistros] = useState([]);
    const [prestadores, setPrestadores] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        try {
            const [dados, prests] = await Promise.all([
                dadosBancariosService.listar(),
                prestadorService.listar()
            ]);

            const registrosFormatados = dados.map(item => ({
                dadosId: item.dadosId || item.id,
                codPrestador: item.codPrestador,
                banco: item.banco,
                tipoConta: item.tipoConta,
                agencia: item.agencia,
                conta: item.conta,
                chavePix: item.chavePix || ''
            }));

            setRegistros(registrosFormatados);
            setPrestadores(prests || []);

            if (registrosFormatados.length > 0) {
                selecionarRegistro(registrosFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarRegistro = (registro, index) => {
        setCurrentIndex(index);
        setDadosId(registro.dadosId);
        setCodPrestador(registro.codPrestador);
        setBanco(registro.banco);
        setTipoConta(registro.tipoConta);
        setAgencia(registro.agencia);
        setConta(registro.conta);
        setChavePix(registro.chavePix || '');
        setModo('visualizacao');
        setErrors({});
        setMessage(null);
    };

    const validarCampos = () => {
        const novoErros = {};
        if (!codPrestador) novoErros.prestador = 'Prestador é obrigatório';
        if (!banco.trim()) novoErros.banco = 'Banco é obrigatório';
        if (!tipoConta) novoErros.tipoConta = 'Tipo de conta é obrigatório';
        if (!agencia.trim()) novoErros.agencia = 'Agência é obrigatória';
        if (!conta.trim()) novoErros.conta = 'Conta é obrigatória';
        setErrors(novoErros);
        return Object.keys(novoErros).length === 0;
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = registros.filter(reg =>
            reg.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.codPrestador.toString().includes(searchTerm) ||
            reg.conta.includes(searchTerm)
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} registro(s) encontrado(s)` : 'Nenhum registro encontrado'
        });
    };

    const handleNovo = () => {
        setDadosId('');
        setCodPrestador('');
        setBanco('');
        setTipoConta('');
        setAgencia('');
        setConta('');
        setChavePix('');
        setModo('criacao');
        setErrors({});
        setMessage(null);
    };

    const handleEditar = () => {
        setModo('edicao');
        setErrors({});
        setMessage(null);
    };

    const handleCancelar = () => {
        setModo('visualizacao');
        setErrors({});
        setMessage(null);
        if (currentIndex >= 0) {
            selecionarRegistro(registros[currentIndex], currentIndex);
        }
    };

    const handleSave = async () => {
        if (!validarCampos()) return;

        const dados = {
            codPrestador: parseInt(codPrestador),
            banco,
            tipoConta,
            agencia,
            conta,
            chavePix: chavePix || null
        };

        setLoading(true);
        try {
            if (modo === 'edicao' && dadosId) {
                await dadosBancariosService.atualizar(dadosId, dados);
                setRegistros(prev =>
                    prev.map(r => r.dadosId === dadosId ? { dadosId, ...dados } : r)
                );
                setMessage({ type: 'success', text: 'Dados bancários atualizados!' });
            } else if (modo === 'criacao') {
                const novo = await dadosBancariosService.criar(dados);
                const novaLista = [...registros, novo];
                setRegistros(novaLista);
                setMessage({ type: 'success', text: 'Dados bancários cadastrados!' });
                selecionarRegistro(novo, novaLista.length - 1);
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!dadosId || !window.confirm(`Excluir dados bancários?`)) return;

        setLoading(true);
        try {
            await dadosBancariosService.deletar(dadosId);
            const filtered = registros.filter(r => r.dadosId !== dadosId);
            setRegistros(filtered);

            if (filtered.length === 0) {
                setDadosId('');
                setCodPrestador('');
                setBanco('');
                setTipoConta('');
                setAgencia('');
                setConta('');
                setChavePix('');
                setCurrentIndex(-1);
            } else {
                const newIndex = Math.min(currentIndex, filtered.length - 1);
                selecionarRegistro(filtered[newIndex], newIndex);
            }
            setMessage({ type: 'success', text: 'Dados excluídos com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
            setModo('visualizacao');
        }
    };

    const handleNavNext = () => {
        if (currentIndex < registros.length - 1) {
            selecionarRegistro(registros[currentIndex + 1], currentIndex + 1);
        }
    };

    const handleNavPrev = () => {
        if (currentIndex > 0) {
            selecionarRegistro(registros[currentIndex - 1], currentIndex - 1);
        }
    };

    const prestadoresOptions = prestadores.map(p => ({
        value: p.codPrestador,
        label: p.nome
    }));

    const tiposContaOptions = [
        { value: 'CORRENTE', label: 'Corrente' },
        { value: 'POUPANCA', label: 'Poupança' },
        { value: 'SALARIO', label: 'Salário' }
    ];

    const formContent = (
        <div>
            <FormGroup title="🏦 Dados Bancários">
                <FormRow>
                    <FormField
                        label="ID"
                        value={dadosId}
                        disabled
                        placeholder="Gerado automaticamente"
                    />
                    <FormSelect
                        label="Prestador"
                        value={codPrestador}
                        onChange={(e) => { setCodPrestador(e.target.value); if (errors.prestador) setErrors({ ...errors, prestador: null }); }}
                        options={prestadoresOptions}
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.prestador}
                    />
                </FormRow>

                <FormRow>
                    <FormField
                        label="Banco"
                        value={banco}
                        onChange={(e) => { setBanco(e.target.value); if (errors.banco) setErrors({ ...errors, banco: null }); }}
                        placeholder="Ex: Caixa, Itaú, Bradesco"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.banco}
                    />
                    <FormSelect
                        label="Tipo de Conta"
                        value={tipoConta}
                        onChange={(e) => { setTipoConta(e.target.value); if (errors.tipoConta) setErrors({ ...errors, tipoConta: null }); }}
                        options={tiposContaOptions}
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.tipoConta}
                    />
                </FormRow>

                <FormRow>
                    <FormField
                        label="Agência"
                        value={agencia}
                        onChange={(e) => { setAgencia(e.target.value); if (errors.agencia) setErrors({ ...errors, agencia: null }); }}
                        placeholder="0001"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.agencia}
                    />
                    <FormField
                        label="Conta"
                        value={conta}
                        onChange={(e) => { setConta(e.target.value); if (errors.conta) setErrors({ ...errors, conta: null }); }}
                        placeholder="1234567"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.conta}
                    />
                </FormRow>

                <FormField
                    label="Chave PIX (Opcional)"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                    disabled={modo === 'visualizacao'}
                />
            </FormGroup>

            {modo === 'visualizacao' && (
                <FormGroup title="🔍 Pesquisar">
                    <div className={styles.searchBox}>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Pesquisar por banco, prestador ou conta..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className={styles.searchInput}
                            />
                            <button onClick={handleSearch} className={styles.searchBtn}>
                                🔍 Pesquisar
                            </button>
                        </div>
                        {searchResults.length > 0 && (
                            <div className={styles.resultsList}>
                                {searchResults.map((reg, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.resultItem}
                                        onClick={() => {
                                            selecionarRegistro(reg, registros.findIndex(r => r.dadosId === reg.dadosId));
                                            setSearchResults([]);
                                        }}
                                    >
                                        <div>
                                            <div className={styles.resultName}>{reg.banco} - {reg.tipoConta}</div>
                                            <div className={styles.resultCnpj}>Ag: {reg.agencia} | Conta: {reg.conta}</div>
                                        </div>
                                        <span>→</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </FormGroup>
            )}
        </div>
    );

    return (
        <div>
            <FormLayout
                title={modo === 'criacao' ? 'Novos Dados Bancários' : modo === 'edicao' ? 'Editar Dados Bancários' : 'Dados Bancários'}
                icon="🏦"
                message={message}
                loading={loading}
                onSubmit={handleSave}
                onCancel={handleCancelar}
                showCancel={modo !== 'visualizacao'}
                submitLabel={modo === 'criacao' ? 'Cadastrar' : modo === 'edicao' ? 'Atualizar' : 'Salvar'}
            >
                {formContent}
            </FormLayout>

            {modo === 'visualizacao' && registros.length > 0 && (
                <div className={styles.toolbar}>
                    <button onClick={handleEditar} className={styles.toolBtn + ' ' + styles.edit} disabled={!dadosId}>
                        ✏️ Editar
                    </button>
                    <button onClick={handleDelete} className={styles.toolBtn + ' ' + styles.delete} disabled={!dadosId}>
                        🗑️ Deletar
                    </button>
                    <button onClick={handleNovo} className={styles.toolBtn + ' ' + styles.add}>
                        ➕ Novo
                    </button>
                </div>
            )}

            {modo === 'visualizacao' && registros.length > 0 && (
                <div className={styles.navBar}>
                    <button onClick={handleNavPrev} disabled={currentIndex <= 0} className={styles.navBtn}>
                        ← Anterior
                    </button>
                    <span className={styles.counter}>
                        {registros.length > 0 ? `${currentIndex + 1} de ${registros.length}` : 'Nenhum registro'}
                    </span>
                    <button onClick={handleNavNext} disabled={currentIndex >= registros.length - 1} className={styles.navBtn}>
                        Próximo →
                    </button>
                </div>
            )}
        </div>
    );
}

export default DadosBancariosCadastroModerno;

