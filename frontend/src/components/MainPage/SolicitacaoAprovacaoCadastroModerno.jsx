import React, { useState, useEffect } from 'react';
import { FormLayout, FormGroup, FormField, FormSelect, FormRow } from '../../Shared/FormLayout';
import { solicitacaoAprovacaoService } from '../../services/solicitacaoAprovacaoService';
import { orcamentoService } from '../../services/orcamentoService';
import styles from './FormulariosPadraoModerno.module.css';

function SolicitacaoAprovacaoCadastroModerno() {
    const [solicitacaoID, setSolicitacaoID] = useState('');
    const [orcamentoID, setOrcamentoID] = useState('');
    const [movimento, setMovimento] = useState('');
    const [status, setStatus] = useState('PENDENTE');

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [orcamentos, setOrcamentos] = useState([]);
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
            const [solicits, orcs] = await Promise.all([
                solicitacaoAprovacaoService.listar(),
                orcamentoService.listar()
            ]);

            setSolicitacoes(solicits || []);
            setOrcamentos(orcs || []);

            if (solicits && solicits.length > 0) {
                selecionarSolicitacao(solicits[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarSolicitacao = (solicitacao, index) => {
        setCurrentIndex(index);
        setSolicitacaoID(solicitacao.solicitacaoAprovacaoID);
        setOrcamentoID(solicitacao.orcamentoId);
        setMovimento(solicitacao.movimento);
        setStatus(solicitacao.statusSolicitacao || 'PENDENTE');
        setModo('visualizacao');
        setErrors({});
        setMessage(null);
    };

    const validarCampos = () => {
        const novoErros = {};
        if (!orcamentoID) novoErros.orcamento = 'Orçamento é obrigatório';
        if (!movimento) novoErros.movimento = 'Data é obrigatória';
        setErrors(novoErros);
        return Object.keys(novoErros).length === 0;
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = solicitacoes.filter(s =>
            s.solicitacaoAprovacaoID.toString().includes(searchTerm) ||
            s.statusSolicitacao.includes(searchTerm.toUpperCase())
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} solicitação(ões) encontrada(s)` : 'Nenhuma solicitação encontrada'
        });
    };

    const handleNovo = () => {
        setSolicitacaoID('');
        setOrcamentoID('');
        setMovimento('');
        setStatus('PENDENTE');
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
            selecionarSolicitacao(solicitacoes[currentIndex], currentIndex);
        }
    };

    const handleSave = async () => {
        if (!validarCampos()) return;

        const dados = {
            orcamentoId: parseInt(orcamentoID),
            movimento,
            statusSolicitacao: status
        };

        setLoading(true);
        try {
            if (modo === 'edicao' && solicitacaoID) {
                await solicitacaoAprovacaoService.atualizar(solicitacaoID, dados);
                setSolicitacoes(prev =>
                    prev.map(s => s.solicitacaoAprovacaoID === solicitacaoID ? { ...s, ...dados } : s)
                );
                setMessage({ type: 'success', text: 'Solicitação atualizada!' });
            } else if (modo === 'criacao') {
                const nova = await solicitacaoAprovacaoService.criar(dados);
                const novaLista = [...solicitacoes, nova];
                setSolicitacoes(novaLista);
                setMessage({ type: 'success', text: 'Solicitação cadastrada!' });
                selecionarSolicitacao(nova, novaLista.length - 1);
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!solicitacaoID || !window.confirm('Excluir solicitação?')) return;

        setLoading(true);
        try {
            await solicitacaoAprovacaoService.deletar(solicitacaoID);
            const filtered = solicitacoes.filter(s => s.solicitacaoAprovacaoID !== solicitacaoID);
            setSolicitacoes(filtered);

            if (filtered.length === 0) {
                setSolicitacaoID('');
                setOrcamentoID('');
                setMovimento('');
                setStatus('PENDENTE');
                setCurrentIndex(-1);
            } else {
                const newIndex = Math.min(currentIndex, filtered.length - 1);
                selecionarSolicitacao(filtered[newIndex], newIndex);
            }
            setMessage({ type: 'success', text: 'Solicitação excluída!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
            setModo('visualizacao');
        }
    };

    const handleNavNext = () => {
        if (currentIndex < solicitacoes.length - 1) {
            selecionarSolicitacao(solicitacoes[currentIndex + 1], currentIndex + 1);
        }
    };

    const handleNavPrev = () => {
        if (currentIndex > 0) {
            selecionarSolicitacao(solicitacoes[currentIndex - 1], currentIndex - 1);
        }
    };

    const orcamentosOptions = orcamentos.map(o => ({
        value: o.orcamentoID,
        label: `#${o.orcamentoID} - R$ ${o.valor?.toFixed(2)}`
    }));

    const statusOptions = [
        { value: 'PENDENTE', label: 'Pendente' },
        { value: 'APROVADO', label: 'Aprovado' },
        { value: 'REJEITADO', label: 'Rejeitado' }
    ];

    const formContent = (
        <div>
            <FormGroup title="✅ Solicitação de Aprovação">
                <FormRow>
                    <FormField
                        label="ID"
                        value={solicitacaoID}
                        disabled
                        placeholder="Gerado automaticamente"
                    />
                    <FormField
                        label="Data"
                        value={movimento}
                        onChange={(e) => { setMovimento(e.target.value); if (errors.movimento) setErrors({ ...errors, movimento: null }); }}
                        type="date"
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.movimento}
                    />
                </FormRow>

                <FormRow>
                    <FormSelect
                        label="Orçamento"
                        value={orcamentoID}
                        onChange={(e) => { setOrcamentoID(e.target.value); if (errors.orcamento) setErrors({ ...errors, orcamento: null }); }}
                        options={orcamentosOptions}
                        required
                        disabled={modo === 'visualizacao'}
                        error={errors.orcamento}
                    />
                    <FormSelect
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        options={statusOptions}
                        disabled={modo === 'visualizacao'}
                    />
                </FormRow>
            </FormGroup>

            {modo === 'visualizacao' && (
                <FormGroup title="🔍 Pesquisar">
                    <div className={styles.searchBox}>
                        <div className={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Pesquisar por ID ou status..."
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
                                {searchResults.map((sol, idx) => (
                                    <div
                                        key={idx}
                                        className={styles.resultItem}
                                        onClick={() => {
                                            selecionarSolicitacao(sol, solicitacoes.findIndex(s => s.solicitacaoAprovacaoID === sol.solicitacaoAprovacaoID));
                                            setSearchResults([]);
                                        }}
                                    >
                                        <div>
                                            <div className={styles.resultName}>#{sol.solicitacaoAprovacaoID}</div>
                                            <div className={styles.resultCnpj}>{sol.statusSolicitacao}</div>
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
                title={modo === 'criacao' ? 'Nova Solicitação' : modo === 'edicao' ? 'Editar Solicitação' : 'Solicitações de Aprovação'}
                icon="✅"
                message={message}
                loading={loading}
                onSubmit={handleSave}
                onCancel={handleCancelar}
                showCancel={modo !== 'visualizacao'}
                submitLabel={modo === 'criacao' ? 'Cadastrar' : modo === 'edicao' ? 'Atualizar' : 'Salvar'}
            >
                {formContent}
            </FormLayout>

            {modo === 'visualizacao' && solicitacoes.length > 0 && (
                <div className={styles.toolbar}>
                    <button onClick={handleEditar} className={styles.toolBtn + ' ' + styles.edit} disabled={!solicitacaoID}>
                        ✏️ Editar
                    </button>
                    <button onClick={handleDelete} className={styles.toolBtn + ' ' + styles.delete} disabled={!solicitacaoID}>
                        🗑️ Deletar
                    </button>
                    <button onClick={handleNovo} className={styles.toolBtn + ' ' + styles.add}>
                        ➕ Novo
                    </button>
                </div>
            )}

            {modo === 'visualizacao' && solicitacoes.length > 0 && (
                <div className={styles.navBar}>
                    <button onClick={handleNavPrev} disabled={currentIndex <= 0} className={styles.navBtn}>
                        ← Anterior
                    </button>
                    <span className={styles.counter}>
                        {solicitacoes.length > 0 ? `${currentIndex + 1} de ${solicitacoes.length}` : 'Nenhum registro'}
                    </span>
                    <button onClick={handleNavNext} disabled={currentIndex >= solicitacoes.length - 1} className={styles.navBtn}>
                        Próximo →
                    </button>
                </div>
            )}
        </div>
    );
}

export default SolicitacaoAprovacaoCadastroModerno;

