import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Edit2, Trash2, Save, X, FileText, Printer } from 'lucide-react';
import styles from './OrcamentoCadastro-novo.module.css';
import { orcamentoService } from '../../services/orcamentoService';
import { empresaService } from '../../services/empresaService';
import { prestadorService } from '../../services/prestadorService';
import ModalPesquisa from './ModalPesquisa';
import ModalPesquisaEmpresa from './ModalPesquisaEmpresa';
import ConfirmModal from '../Shared/ConfirmModal';
import { jsPDF } from 'jspdf';

function OrcamentoCadastro() {
    const [orcamentoID, setOrcamentoID] = useState('');
    const [movimento, setMovimento] = useState('');
    const [movimentoDate, setMovimentoDate] = useState('');
    const [idPrestador, setIdPrestador] = useState('');
    const [empresaID, setEmpresaID] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');

    const [orcamentos, setOrcamentos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [modalPrestadorAberto, setModalPrestadorAberto] = useState(false);
    const [modalEmpresaAberto, setModalEmpresaAberto] = useState(false);

    // Funções de formatação de data
    const formatarDataParaExibicao = (dataISO) => {
        if (!dataISO) return '';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const formatarDataParaInput = (dataBR) => {
        if (!dataBR) return '';
        if (dataBR.includes('-') && dataBR.split('-')[0].length === 4) return dataBR;
        const partes = dataBR.split('/');
        if (partes.length === 3) {
            const [dia, mes, ano] = partes;
            return `${ano}-${mes}-${dia}`;
        }
        return '';
    };

    useEffect(() => {
        carregarOrcamentos();
    }, []);

    const carregarOrcamentos = async () => {
        setLoading(true);
        try {
            const data = await orcamentoService.listar();
            const orcamentosFormatados = data.map(item => ({
                orcamentoID: item.orcamentoID,
                movimento: item.movimento,
                idPrestador: item.idPrestador,
                empresaID: item.empresaID,
                descricao: item.descricao,
                valor: item.valor
            }));
            setOrcamentos(orcamentosFormatados);
            if (orcamentosFormatados.length > 0) {
                selecionarOrcamento(orcamentosFormatados[0], 0);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const selecionarOrcamento = (orcamento, index) => {
        setCurrentIndex(index);
        setOrcamentoID(orcamento.orcamentoID);
        setMovimento(orcamento.movimento);
        setMovimentoDate(formatarDataParaInput(orcamento.movimento));
        setIdPrestador(orcamento.idPrestador);
        setEmpresaID(orcamento.empresaID);
        setDescricao(orcamento.descricao);
        setValor(orcamento.valor);
        setOriginalData({ ...orcamento });
        setModo('visualizacao');
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setMessage({ type: 'error', text: 'Digite um termo para pesquisa!' });
            return;
        }
        const results = orcamentos.filter(orc =>
            orc.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orc.movimento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orc.idPrestador.toString().includes(searchTerm) ||
            orc.empresaID.toString().includes(searchTerm)
        );
        setSearchResults(results);
        setMessage({
            type: results.length ? 'success' : 'error',
            text: results.length ? `${results.length} encontrado(s)` : 'Nenhum orçamento encontrado'
        });
    };

    const selectOrcamento = (orcamento) => {
        const index = orcamentos.findIndex(o => o.orcamentoID === orcamento.orcamentoID);
        selecionarOrcamento(orcamento, index);
        setSearchResults([]);
        setSearchTerm('');
        setMessage({ type: '', text: '' });
    };

    const handlePrestadorSelecionado = (prestadorId) => {
        setIdPrestador(prestadorId);
    };

    const handleEmpresaSelecionada = (empresaId) => {
        setEmpresaID(empresaId);
    };

    const handleEditar = () => {
        setOriginalData({ orcamentoID, movimento, movimentoDate, idPrestador, empresaID, descricao, valor });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setOrcamentoID('');
        setMovimento('');
        setMovimentoDate('');
        setIdPrestador('');
        setEmpresaID('');
        setDescricao('');
        setValor('');
        setModo('criacao');
    };

    const handleCancelar = () => {
        if (modo === 'edicao' && originalData.orcamentoID) {
            setOrcamentoID(originalData.orcamentoID);
            setMovimento(originalData.movimento);
            setMovimentoDate(originalData.movimentoDate);
            setIdPrestador(originalData.idPrestador);
            setEmpresaID(originalData.empresaID);
            setDescricao(originalData.descricao);
            setValor(originalData.valor);
        } else if (modo === 'criacao' && orcamentos.length > 0 && currentIndex >= 0) {
            const atual = orcamentos[currentIndex];
            setOrcamentoID(atual.orcamentoID);
            setMovimento(atual.movimento);
            setMovimentoDate(formatarDataParaInput(atual.movimento));
            setIdPrestador(atual.idPrestador);
            setEmpresaID(atual.empresaID);
            setDescricao(atual.descricao);
            setValor(atual.valor);
        } else if (modo === 'criacao' && orcamentos.length === 0) {
            setOrcamentoID('');
            setMovimento('');
            setMovimentoDate('');
            setIdPrestador('');
            setEmpresaID('');
            setDescricao('');
            setValor('');
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!movimento || !idPrestador || !empresaID || !descricao || !valor) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        const dados = {
            movimento,
            idPrestador: parseInt(idPrestador, 10),
            empresaID: parseInt(empresaID, 10),
            descricao,
            valor: parseFloat(valor)
        };

        setLoading(true);
        try {
            if (modo === 'edicao' && orcamentoID) {
                const atualizado = await orcamentoService.atualizar(orcamentoID, dados);
                const orcamentoMapeado = {
                    orcamentoID: atualizado.orcamentoID,
                    movimento: atualizado.movimento,
                    idPrestador: atualizado.idPrestador,
                    empresaID: atualizado.empresaID,
                    descricao: atualizado.descricao,
                    valor: atualizado.valor
                };
                setOrcamentos(prev => prev.map(o => o.orcamentoID === orcamentoID ? orcamentoMapeado : o));
                setOriginalData(orcamentoMapeado);
                setMessage({ type: 'success', text: 'Orçamento atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await orcamentoService.criar(dados);
                const novoMapeado = {
                    orcamentoID: novo.orcamentoID,
                    movimento: novo.movimento,
                    idPrestador: novo.idPrestador,
                    empresaID: novo.empresaID,
                    descricao: novo.descricao,
                    valor: novo.valor
                };
                setOrcamentos(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarOrcamento(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setMessage({ type: 'success', text: 'Orçamento cadastrado!' });
            }
            setModo('visualizacao');
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        if (!orcamentoID) {
            setMessage({ type: 'error', text: 'Selecione um orçamento!' });
            return;
        }
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
        setLoading(true);
        try {
            await orcamentoService.deletar(orcamentoID);
            const filtered = orcamentos.filter(o => o.orcamentoID !== orcamentoID);
            setOrcamentos(filtered);
            if (filtered.length === 0) {
                setOrcamentoID('');
                setMovimento('');
                setMovimentoDate('');
                setIdPrestador('');
                setEmpresaID('');
                setDescricao('');
                setValor('');
                setCurrentIndex(-1);
                setOriginalData({});
            } else {
                let newIndex = currentIndex;
                if (newIndex >= filtered.length) {
                    newIndex = filtered.length - 1;
                }
                const current = filtered[newIndex];
                setCurrentIndex(newIndex);
                setOrcamentoID(current.orcamentoID);
                setMovimento(current.movimento);
                setMovimentoDate(formatarDataParaInput(current.movimento));
                setIdPrestador(current.idPrestador);
                setEmpresaID(current.empresaID);
                setDescricao(current.descricao);
                setValor(current.valor);
                setOriginalData({ ...current });
            }
            setModo('visualizacao');
            setMessage({ type: 'success', text: 'Orçamento excluído!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex < orcamentos.length - 1) {
            const next = orcamentos[currentIndex + 1];
            selecionarOrcamento(next, currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (modo !== 'visualizacao') return;
        if (currentIndex > 0) {
            const prev = orcamentos[currentIndex - 1];
            selecionarOrcamento(prev, currentIndex - 1);
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    const formatarValor = (value) => {
        const numero = parseFloat(value);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleGerarPDF = async () => {
        if (!orcamentoID) {
            setMessage({ type: 'error', text: 'Selecione um orçamento para gerar o PDF!' });
            return;
        }

        setLoading(true);
        try {
            // Buscar dados completos da empresa e prestador
            const [empresaData, prestadorData] = await Promise.all([
                empresaService.obter(empresaID),
                prestadorService.obter(idPrestador)
            ]);

            // Criar o PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = 20;

            // Título
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ORÇAMENTO', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Linha divisória
            doc.setDrawColor(0);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 15;

            // Dados do Orçamento
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DADOS DO ORÇAMENTO', margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`ID do Orçamento: ${orcamentoID}`, margin, yPos);
            yPos += 7;
            doc.text(`Movimento: ${movimento}`, margin, yPos);
            yPos += 15;

            // Dados da Empresa
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DADOS DA EMPRESA', margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Razão Social: ${empresaData.razaoSocial || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`CNPJ: ${empresaData.cnpj || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`Endereço: ${empresaData.endereco || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`Cidade: ${empresaData.cidade || 'N/A'} - ${empresaData.estado || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`CEP: ${empresaData.cep || 'N/A'}`, margin, yPos);
            yPos += 15;

            // Dados do Prestador
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DADOS DO PRESTADOR', margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(`Nome: ${prestadorData.nome || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`CPF/CNPJ: ${prestadorData.cpfCnpj || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`Email: ${prestadorData.email || 'N/A'}`, margin, yPos);
            yPos += 7;
            doc.text(`Telefone: ${prestadorData.telefone || 'N/A'}`, margin, yPos);
            yPos += 15;

            // Descrição do Serviço
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('DESCRIÇÃO DO SERVIÇO', margin, yPos);
            yPos += 10;

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const descricaoLines = doc.splitTextToSize(descricao || 'N/A', pageWidth - (margin * 2));
            doc.text(descricaoLines, margin, yPos);
            yPos += (descricaoLines.length * 7) + 15;

            // Valor
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('VALOR DO SERVIÇO', margin, yPos);
            yPos += 10;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 100, 0);
            doc.text(formatarValor(valor), margin, yPos);
            doc.setTextColor(0, 0, 0);
            yPos += 20;

            // Linha divisória
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 10;

            // Data de emissão
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            const dataEmissao = new Date().toLocaleDateString('pt-BR');
            doc.text(`Documento gerado em: ${dataEmissao}`, margin, yPos);

            // Salvar o PDF
            doc.save(`orcamento_${orcamentoID}_${movimento.replace(/\//g, '-')}.pdf`);
            setMessage({ type: 'success', text: 'PDF gerado com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao gerar PDF: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <ModalPesquisa
                isOpen={modalPrestadorAberto}
                onClose={() => setModalPrestadorAberto(false)}
                onSelect={handlePrestadorSelecionado}
            />
            <ModalPesquisaEmpresa
                isOpen={modalEmpresaAberto}
                onClose={() => setModalEmpresaAberto(false)}
                onSelect={handleEmpresaSelecionada}
            />

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    <span>💰</span>
                    <h2>Orçamentos</h2>
                </div>
                {orcamentos.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.navigationGroup}>
                        <button
                            className={styles.navButton}
                            onClick={handlePrevious}
                            disabled={currentIndex <= 0 || loading}
                            title="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${orcamentos.length}` : `0/${orcamentos.length}`}
                        </span>
                        <button
                            className={styles.navButton}
                            onClick={handleNext}
                            disabled={currentIndex >= orcamentos.length - 1 || loading}
                            title="Próximo"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
                {(modo === 'edicao' || modo === 'criacao') && (
                    <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                        <button className={styles.navButton} disabled>
                            <ChevronLeft size={20} />
                        </button>
                        <span className={styles.positionIndicator}>
                            {currentIndex >= 0 ? `${currentIndex + 1}/${orcamentos.length}` : `0/${orcamentos.length}`}
                        </span>
                        <button className={styles.navButton} disabled>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Pesquisar por descrição, movimento, prestador ou empresa..."
                        value={searchTerm || ''}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={loading || modo !== 'visualizacao'}
                    />
                    <button
                        className={styles.searchButton}
                        onClick={handleSearch}
                        disabled={loading || modo !== 'visualizacao'}
                    >
                        <Search size={18} /> Pesquisar
                    </button>
                </div>
                {searchResults.length > 0 && modo === 'visualizacao' && (
                    <div className={styles.resultsList}>
                        {searchResults.map(orc => (
                            <div key={orc.orcamentoID} className={styles.resultItem} onClick={() => selectOrcamento(orc)}>
                                <div className={styles.resultItemInfo}>
                                    <span className={styles.resultItemName}>{orc.descricao}</span>
                                    <span className={styles.resultItemDoc}>
                                        Data: {orc.movimento} | Valor: {formatarValor(orc.valor)}
                                    </span>
                                </div>
                                <span>👉</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>ID ORÇAMENTO</label>
                        <input type="text" value={orcamentoID || ''} disabled placeholder="Automático" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>MOVIMENTO *</label>
                        <div className={styles.dateInputGroup}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={movimentoDate}
                                onChange={(e) => {
                                    const dataSelecionada = e.target.value;
                                    setMovimentoDate(dataSelecionada);
                                    if (dataSelecionada) {
                                        const [ano, mes, dia] = dataSelecionada.split('-');
                                        setMovimento(`${dia}/${mes}/${ano}`);
                                    } else {
                                        setMovimento('');
                                    }
                                }}
                                disabled={camposDesabilitados}
                            />
                            {movimento && (
                                <span className={styles.dateDisplay}>
                                    Data selecionada: {movimento}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>ID PRESTADOR *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={idPrestador || ''}
                                onChange={(e) => setIdPrestador(e.target.value)}
                                placeholder="Código do prestador"
                                disabled={camposDesabilitados}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalPrestadorAberto(true)}
                                disabled={loading || camposDesabilitados}
                                type="button"
                                title="Pesquisar prestador"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>EMPRESA ID *</label>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={empresaID || ''}
                                onChange={(e) => setEmpresaID(e.target.value)}
                                placeholder="Código da empresa"
                                disabled={camposDesabilitados}
                            />
                            <button
                                className={styles.searchIconButton}
                                onClick={() => setModalEmpresaAberto(true)}
                                disabled={loading || camposDesabilitados}
                                type="button"
                                title="Pesquisar empresa"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>DESCRIÇÃO *</label>
                        <textarea
                            value={descricao || ''}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descrição do orçamento"
                            disabled={camposDesabilitados}
                            rows={4}
                        />
                    </div>

                    <div className={`${styles.formGroup} ${styles.valorField}`}>
                        <label>VALOR *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={valor || ''}
                            onChange={(e) => setValor(e.target.value)}
                            placeholder="0,00"
                            disabled={camposDesabilitados}
                        />
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    {modo === 'visualizacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnEdit}`}
                                onClick={handleEditar}
                                disabled={loading || !orcamentoID}
                                title="Editar orçamento"
                            >
                                <Edit2 size={18} /> Editar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnNew}`}
                                onClick={handleNovo}
                                disabled={loading}
                                title="Criar novo orçamento"
                            >
                                <Plus size={18} /> Novo
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnPDF}`}
                                onClick={handleGerarPDF}
                                disabled={loading || !orcamentoID}
                                title="Gerar PDF do orçamento"
                            >
                                <Printer size={18} /> Gerar PDF
                            </button>
                        </>
                    )}
                    {modo === 'edicao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                                title="Salvar alterações"
                            >
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnDelete}`}
                                onClick={handleDeleteClick}
                                disabled={loading || !orcamentoID}
                                title="Excluir orçamento"
                            >
                                <Trash2 size={18} /> Excluir
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar edição"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </>
                    )}
                    {modo === 'criacao' && (
                        <>
                            <button
                                className={`${styles.btn} ${styles.btnSave}`}
                                onClick={handleSave}
                                disabled={loading}
                                title="Salvar novo orçamento"
                            >
                                <Save size={18} /> Salvar
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnCancel}`}
                                onClick={handleCancelar}
                                disabled={loading}
                                title="Cancelar criação"
                            >
                                <X size={18} /> Cancelar
                            </button>
                        </>
                    )}
                </div>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
                itemName={`Orçamento #${orcamentoID}`}
                confirmText="Sim, Excluir"
                cancelText="Cancelar"
            />
        </div>
    );
}

export default OrcamentoCadastro;