import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast, Search, Plus, Edit2, Trash2, Save, X, FileText, Printer, Trash, Image, Upload, ZoomIn } from 'lucide-react';
import styles from './OrcamentoCadastro-novo.module.css';
import { orcamentoService } from '../../services/orcamentoService';
import { empresaService } from '../../services/empresaService';
import { prestadorService } from '../../services/prestadorService';
import { itemService } from '../../services/itemService';
import ModalPesquisa from './ModalPesquisa';
import ModalPesquisaEmpresa from './ModalPesquisaEmpresa';
import ModalPesquisaItens from './ModalPesquisaItens';
import ConfirmModal from '../Shared/ConfirmModal';
import { BarraPesquisa, ResultadosPesquisa } from '../common';
import { usePesquisa } from '../../hooks/usePesquisa';
import headerStyles from './EmpresaCadastro-novo.module.css';
import ModalPesquisaComum from './ModalPesquisaComum';
import { useMensagemTemporaria } from '../../hooks/useMensagemTemporaria';

function OrcamentoCadastro() {
    const [showFilters, setShowFilters] = useState(false);
    const [quickSearchId, setQuickSearchId] = useState('');
    const [orcamentoID, setOrcamentoID] = useState('');
    const [movimento, setMovimento] = useState('');
    const [movimentoDate, setMovimentoDate] = useState('');
    const [idPrestador, setIdPrestador] = useState('');
    const [nomePrestador, setNomePrestador] = useState('');
    const [empresaID, setEmpresaID] = useState('');
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [valorTotalItens, setValorTotalItens] = useState('');
    const [desconto, setDesconto] = useState('');
    const [valorFinal, setValorFinal] = useState('');
    const [tipoPagamento, setTipoPagamento] = useState('');
    const [itensOrcamento, setItensOrcamento] = useState([]);
    const [imagens, setImagens] = useState([]);
    const [pendingImages, setPendingImages] = useState([]); // Imagens pendentes para upload
    const [previewImage, setPreviewImage] = useState(null); // Imagem sendo visualizada

    const [orcamentos, setOrcamentos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modo, setModo] = useState('visualizacao'); // 'visualizacao', 'edicao', 'criacao'
    const [originalData, setOriginalData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Hook de mensagem temporária (3 segundos)
    const [message, setMessage] = useMensagemTemporaria(3000);

    const [modalPrestadorAberto, setModalPrestadorAberto] = useState(false);
    const [modalEmpresaAberto, setModalEmpresaAberto] = useState(false);
    const [modalItensAberto, setModalItensAberto] = useState(false);

    const fileInputRef = useRef(null);

    // Configuração dos campos de pesquisa
    const camposPesquisaOrcamento = [
        { campo: 'descricao', label: 'Descrição' },
        { campo: 'movimento', label: 'Data Movimento' },
        { campo: 'idPrestador', label: 'ID Prestador' },
        { campo: 'empresaID', label: 'ID Empresa' },
        { campo: 'orcamentoID', label: 'ID Orçamento' },
        { campo: 'tipoPagamento', label: 'Tipo Pagamento' }
    ];

    // Hook de pesquisa
    const {
        termoPesquisa,
        setTermoPesquisa,
        campoSelecionado,
        setCampoSelecionado,
        resultados,
        mostrarResultados,
        handlePesquisar,
        handleLimparPesquisa,
        handleSelecionarResultado
    } = usePesquisa(orcamentos, camposPesquisaOrcamento);

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
                valor: item.valor,
                valorTotalItens: item.valorTotalItens,
                desconto: item.desconto,
                valorFinal: item.valorFinal,
                tipoPagamento: item.tipoPagamento,
                itens: item.itens || [],
                imagens: item.imagens || []
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
        
        // Buscar nomes do prestador e empresa
        if (orcamento.idPrestador) {
            prestadorService.obter(orcamento.idPrestador)
                .then(prestador => {
                    setNomePrestador(prestador.nome || '');
                })
                .catch(error => {
                    console.error('Erro ao buscar prestador:', error);
                    setNomePrestador('');
                });
        }
        
        if (orcamento.empresaID) {
            empresaService.obter(orcamento.empresaID)
                .then(empresa => {
                    // O campo correto é 'razao' ou 'nome', não 'razaoSocial'
                    setNomeEmpresa(empresa.razao || empresa.nome || '');
                })
                .catch(error => {
                    console.error('Erro ao buscar empresa:', error);
                    setNomeEmpresa('');
                });
        }
        
        setDescricao(orcamento.descricao);
        setValor(orcamento.valor);
        setValorTotalItens(orcamento.valorTotalItens || '');
        setDesconto(orcamento.desconto || '');
        setValorFinal(orcamento.valorFinal || '');
        setTipoPagamento(orcamento.tipoPagamento || '');
        setItensOrcamento(orcamento.itens || []);
        setImagens(orcamento.imagens || []);
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
        // Buscar nome do prestador
        if (prestadorId) {
            prestadorService.obter(prestadorId)
                .then(prestador => {
                    setNomePrestador(prestador.nome || '');
                })
                .catch(error => {
                    console.error('Erro ao buscar prestador:', error);
                    setNomePrestador('');
                });
        } else {
            setNomePrestador('');
        }
    };

    const handleEmpresaSelecionada = (empresaId) => {
        console.log('Empresa selecionada:', empresaId);
        setEmpresaID(empresaId);
        // Buscar nome da empresa
        if (empresaId) {
            empresaService.obter(empresaId)
                .then(empresa => {
                    console.log('Empresa encontrada:', empresa);
                    // O campo correto é 'razao' ou 'nome', não 'razaoSocial'
                    setNomeEmpresa(empresa.razao || empresa.nome || '');
                })
                .catch(error => {
                    console.error('Erro ao buscar empresa:', error);
                    setNomeEmpresa('');
                });
        } else {
            setNomeEmpresa('');
        }
    };

    const handleEditar = () => {
        setOriginalData({ 
            orcamentoID, 
            movimento, 
            movimentoDate, 
            idPrestador, 
            nomePrestador,
            empresaID, 
            nomeEmpresa,
            descricao, 
            valor, 
            valorTotalItens, 
            desconto, 
            valorFinal, 
            tipoPagamento, 
            itens: itensOrcamento, 
            imagens 
        });
        setModo('edicao');
    };

    const handleNovo = () => {
        setOriginalData({});
        setOrcamentoID('');
        setMovimento('');
        setMovimentoDate('');
        setIdPrestador('');
        setNomePrestador('');
        setEmpresaID('');
        setNomeEmpresa('');
        setDescricao('');
        setValor('');
        setValorTotalItens('');
        setDesconto('');
        setValorFinal('');
        setTipoPagamento('');
        setItensOrcamento([]);
        setImagens([]);
        setPendingImages([]);
        setModo('criacao');
    };

    const handleCancelar = () => {
        setPendingImages([]);
        if (modo === 'edicao' && originalData.orcamentoID) {
            setOrcamentoID(originalData.orcamentoID);
            setMovimento(originalData.movimento);
            setMovimentoDate(originalData.movimentoDate);
            setIdPrestador(originalData.idPrestador);
            setEmpresaID(originalData.empresaID);
            setNomePrestador(originalData.nomePrestador || '');
            setNomeEmpresa(originalData.nomeEmpresa || '');
            setDescricao(originalData.descricao);
            setValor(originalData.valor);
            setValorTotalItens(originalData.valorTotalItens);
            setDesconto(originalData.desconto);
            setValorFinal(originalData.valorFinal);
            setTipoPagamento(originalData.tipoPagamento);
            setItensOrcamento(originalData.itens || []);
            setImagens(originalData.imagens || []);
        } else if (modo === 'criacao' && orcamentos.length > 0 && currentIndex >= 0) {
            const atual = orcamentos[currentIndex];
            setOrcamentoID(atual.orcamentoID);
            setMovimento(atual.movimento);
            setMovimentoDate(formatarDataParaInput(atual.movimento));
            setIdPrestador(atual.idPrestador);
            setEmpresaID(atual.empresaID);
            setDescricao(atual.descricao);
            setValor(atual.valor);
            setValorTotalItens(atual.valorTotalItens || '');
            setDesconto(atual.desconto || '');
            setValorFinal(atual.valorFinal || '');
            setTipoPagamento(atual.tipoPagamento || '');
            setItensOrcamento(atual.itens || []);
            setImagens(atual.imagens || []);
            // Restaurar nomes
            if (atual.idPrestador) {
                prestadorService.obter(atual.idPrestador)
                    .then(prestador => setNomePrestador(prestador.nome || ''))
                    .catch(() => setNomePrestador(''));
            }
            if (atual.empresaID) {
                empresaService.obter(atual.empresaID)
                    .then(empresa => setNomeEmpresa(empresa.razao || empresa.nome || ''))
                    .catch(() => setNomeEmpresa(''));
            }
        } else if (modo === 'criacao' && orcamentos.length === 0) {
            setOrcamentoID('');
            setMovimento('');
            setMovimentoDate('');
            setIdPrestador('');
            setEmpresaID('');
            setNomePrestador('');
            setNomeEmpresa('');
            setDescricao('');
            setValor('');
            setValorTotalItens('');
            setDesconto('');
            setValorFinal('');
            setTipoPagamento('');
            setItensOrcamento([]);
            setImagens([]);
        }
        setModo('visualizacao');
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!movimento || !idPrestador || !empresaID) {
            setMessage({ type: 'error', text: 'Preencha todos os campos obrigatórios!' });
            return;
        }

        const dados = {
            movimento,
            idPrestador: parseInt(idPrestador, 10),
            empresaID: parseInt(empresaID, 10),
            descricao,
            valor: parseFloat(valor) || 0,
            desconto: parseFloat(desconto) || 0,
            tipoPagamento: tipoPagamento || null,
            itens: itensOrcamento.map(item => ({
                itemId: item.itemId,
                quantidade: parseInt(item.quantidade, 10),
                valorUnitario: parseFloat(item.valorUnitario)
            }))
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
                    valor: atualizado.valor,
                    valorTotalItens: atualizado.valorTotalItens,
                    desconto: atualizado.desconto,
                    valorFinal: atualizado.valorFinal,
                    tipoPagamento: atualizado.tipoPagamento,
                    itens: atualizado.itens || [],
                    imagens: atualizado.imagens || []
                };
                setOrcamentos(prev => prev.map(o => o.orcamentoID === orcamentoID ? orcamentoMapeado : o));
                setOriginalData(orcamentoMapeado);
                setValorTotalItens(atualizado.valorTotalItens || '');
                setValorFinal(atualizado.valorFinal || '');
                setImagens(atualizado.imagens || []);
                setMessage({ type: 'success', text: 'Orçamento atualizado!' });
            } else if (modo === 'criacao') {
                const novo = await orcamentoService.criar(dados);
                const novoMapeado = {
                    orcamentoID: novo.orcamentoID,
                    movimento: novo.movimento,
                    idPrestador: novo.idPrestador,
                    empresaID: novo.empresaID,
                    descricao: novo.descricao,
                    valor: novo.valor,
                    valorTotalItens: novo.valorTotalItens,
                    desconto: novo.desconto,
                    valorFinal: novo.valorFinal,
                    tipoPagamento: novo.tipoPagamento,
                    itens: novo.itens || [],
                    imagens: novo.imagens || []
                };
                
                // Fazer upload das imagens pendentes
                let imagensSalvas = [];
                if (pendingImages.length > 0) {
                    for (const img of pendingImages) {
                        try {
                            const imagemSalva = await orcamentoService.uploadImagem(novo.orcamentoID, img.file);
                            imagensSalvas.push(imagemSalva);
                        } catch (uploadError) {
                            console.error('Erro ao fazer upload de imagem:', uploadError);
                        }
                    }
                }
                
                // Atualizar com as imagens salvas
                novoMapeado.imagens = imagensSalvas;
                
                setOrcamentos(prev => {
                    const updated = [...prev, novoMapeado];
                    setTimeout(() => {
                        selecionarOrcamento(novoMapeado, updated.length - 1);
                    }, 0);
                    return updated;
                });
                setOrcamentoID(novo.orcamentoID);
                setOriginalData(novoMapeado);
                setImagens(imagensSalvas);
                setPendingImages([]);
                setModo('visualizacao');
                setMessage({ type: 'success', text: pendingImages.length > 0 
                    ? `Orçamento cadastrado com ${imagensSalvas.length} imagem(ns)!` 
                    : 'Orçamento cadastrado!' });
                return;
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
                setValorTotalItens('');
                setDesconto('');
                setValorFinal('');
                setTipoPagamento('');
                setItensOrcamento([]);
                setImagens([]);
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
                setValorTotalItens(current.valorTotalItens || '');
                setDesconto(current.desconto || '');
                setValorFinal(current.valorFinal || '');
                setTipoPagamento(current.tipoPagamento || '');
                setItensOrcamento(current.itens || []);
                setImagens(current.imagens || []);
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

    const handleFirst = () => {
        if (modo !== 'visualizacao') return;
        if (orcamentos.length > 0 && currentIndex !== 0) {
            selecionarOrcamento(orcamentos[0], 0);
        }
    };

    const handleLast = () => {
        if (modo !== 'visualizacao') return;
        if (orcamentos.length > 0 && currentIndex !== orcamentos.length - 1) {
            const lastIndex = orcamentos.length - 1;
            selecionarOrcamento(orcamentos[lastIndex], lastIndex);
        }
    };

    // Busca rápida por ID no header
    const handleQuickSearchById = (e) => {
        if (e.key === 'Enter' && quickSearchId.trim()) {
            const id = parseInt(quickSearchId.trim());
            if (isNaN(id)) {
                setMessage({ type: 'error', text: 'Digite um ID válido!' });
                return;
            }
            const registro = orcamentos.find(o => o.orcamentoID === id);
            if (registro) {
                const index = orcamentos.findIndex(o => o.orcamentoID === id);
                selecionarOrcamento(registro, index);
                setQuickSearchId('');
                setMessage({ type: 'success', text: `Orçamento ID ${id} encontrado!` });
            } else {
                setMessage({ type: 'error', text: `Orçamento com ID ${id} não encontrado!` });
            }
        }
    };

    const camposDesabilitados = modo === 'visualizacao' || loading;

    const formatarValor = (value) => {
        const numero = parseFloat(value);
        if (isNaN(numero)) return '';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    // Funções para gerenciar itens do orçamento
    const handleAdicionarItem = async (item) => {
        try {
            // Buscar detalhes completos do item incluindo descontos, descricao, tipoUnitario, precoMedio
            const itemCompleto = await itemService.obter(item.id);
            
            console.log('Item adicionado - Dados completos:', itemCompleto);
            
            const novoItem = {
                itemId: itemCompleto.idItem,
                itemNome: itemCompleto.nome,
                descricao: itemCompleto.descricao || '',
                tipoUnitario: itemCompleto.tipoUnitario || 'UNIDADE',
                precoMedio: itemCompleto.precoMedio || 0,
                valorUnitarioOriginal: itemCompleto.valorUnitario || 0,
                valorComDesconto: null,
                quantidade: 1,
                valorUnitario: itemCompleto.valorUnitario || 0,
                valorTotal: itemCompleto.valorUnitario || 0,
                descontos: itemCompleto.descontos || []
            };
            const novosItens = [...itensOrcamento, novoItem];
            setItensOrcamento(novosItens);
            calcularTotais(novosItens, desconto);
        } catch (error) {
            console.error('Erro ao buscar detalhes do item:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar detalhes do item' });
        }
    };

    const handleRemoverItem = (index) => {
        const novosItens = itensOrcamento.filter((_, i) => i !== index);
        setItensOrcamento(novosItens);
        calcularTotais(novosItens, desconto);
    };

    const handleQuantidadeChange = async (index, novaQuantidade) => {
        const qtd = parseInt(novaQuantidade, 10) || 0;
        const itemAtual = itensOrcamento[index];
        
        try {
            // Consultar o item completo no backend para obter os descontos
            const itemCompleto = await itemService.obter(itemAtual.itemId);
            
            console.log('Item completo recebido:', itemCompleto);
            console.log('Descontos disponíveis:', itemCompleto.descontos);
            console.log('Quantidade informada:', qtd);
            
            // Calcular valor com desconto baseado na quantidade
            let valorUnitarioComDesconto = itemCompleto.valorUnitario;
            let valorComDesconto = null;
            
            if (itemCompleto.descontos && itemCompleto.descontos.length > 0 && qtd > 0) {
                // Encontrar o melhor desconto aplicável
                let melhorDesconto = null;
                for (const desconto of itemCompleto.descontos) {
                    console.log(`Verificando desconto: qtdMinima=${desconto.quantidadeMinima}, valorFinal=${desconto.valorFinal}, percentual=${desconto.percentualDesconto}`);
                    if (qtd >= desconto.quantidadeMinima) {
                        if (!melhorDesconto || desconto.quantidadeMinima > melhorDesconto.quantidadeMinima) {
                            melhorDesconto = desconto;
                            console.log('Melhor desconto encontrado:', melhorDesconto);
                        }
                    }
                }
                
                // Aplicar desconto se encontrado
                if (melhorDesconto) {
                    console.log('Aplicando desconto:', melhorDesconto);
                    if (melhorDesconto.valorFinal != null) {
                        valorUnitarioComDesconto = melhorDesconto.valorFinal;
                        valorComDesconto = melhorDesconto.valorFinal;
                        console.log(`Usando valorFinal: ${valorUnitarioComDesconto}`);
                    } else if (melhorDesconto.percentualDesconto != null) {
                        valorUnitarioComDesconto = itemCompleto.valorUnitario * (1 - (melhorDesconto.percentualDesconto / 100));
                        valorComDesconto = valorUnitarioComDesconto;
                        console.log(`Calculando pelo percentual: ${itemCompleto.valorUnitario} * (1 - ${melhorDesconto.percentualDesconto}/100) = ${valorUnitarioComDesconto}`);
                    }
                } else {
                    console.log('Nenhum desconto aplicável para esta quantidade');
                }
            } else {
                console.log('Item sem descontos ou quantidade zero');
            }
            
            // Atualizar o item com o novo valor
            const novosItens = itensOrcamento.map((item, i) => {
                if (i === index) {
                    return {
                        ...item,
                        quantidade: qtd,
                        valorUnitarioOriginal: itemCompleto.valorUnitario,
                        valorComDesconto: valorComDesconto,
                        valorUnitario: parseFloat(valorUnitarioComDesconto.toFixed(2)),
                        valorTotal: parseFloat((qtd * valorUnitarioComDesconto).toFixed(2))
                    };
                }
                return item;
            });
            
            console.log('Novos itens atualizados:', novosItens[index]);
            setItensOrcamento(novosItens);
            calcularTotais(novosItens, desconto);
        } catch (error) {
            console.error('Erro ao consultar desconto:', error);
            // Em caso de erro, usa o cálculo simples
            const novosItens = itensOrcamento.map((item, i) => {
                if (i === index) {
                    return {
                        ...item,
                        quantidade: qtd,
                        valorTotal: parseFloat((qtd * item.valorUnitario).toFixed(2))
                    };
                }
                return item;
            });
            setItensOrcamento(novosItens);
            calcularTotais(novosItens, desconto);
        }
    };

    const handleDescontoChange = (novoDesconto) => {
        const desc = parseFloat(novoDesconto) || 0;
        setDesconto(novoDesconto);
        calcularTotais(itensOrcamento, desc);
    };

    const calcularTotais = (itens, descontoValor) => {
        const totalItens = itens.reduce((acc, item) => acc + (item.valorTotal || 0), 0);
        const final = totalItens - descontoValor;
        setValorTotalItens(totalItens);
        setValorFinal(final > 0 ? final : 0);
        setValor(totalItens);
    };

    // Funções para gerenciar imagens
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de arquivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            setMessage({ type: 'error', text: 'Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)' });
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'O arquivo deve ter no máximo 5MB' });
            return;
        }

        // Se está em modo de criação, armazena a imagem como pendente
        if (modo === 'criacao') {
            const preview = URL.createObjectURL(file);
            setPendingImages(prev => [...prev, { file, preview, name: file.name, size: file.size }]);
            setMessage({ type: 'success', text: 'Imagem adicionada! Ela será enviada ao salvar o orçamento.' });
            // Limpar o input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        // Se não tem orçamento salvo, mostra mensagem
        if (!orcamentoID) {
            setMessage({ type: 'error', text: 'Salve o orçamento antes de adicionar imagens' });
            return;
        }

        setLoading(true);
        try {
            const novaImagem = await orcamentoService.uploadImagem(orcamentoID, file);
            setImagens(prevImagens => [...prevImagens, novaImagem]);
            setMessage({ type: 'success', text: 'Imagem adicionada com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao fazer upload da imagem' });
        } finally {
            setLoading(false);
            // Limpar o input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemoverImagem = async (imagemId) => {
        if (!orcamentoID) return;

        setLoading(true);
        try {
            await orcamentoService.deletarImagem(orcamentoID, imagemId);
            setImagens(prevImagens => prevImagens.filter(img => img.idImagem !== imagemId));
            setMessage({ type: 'success', text: 'Imagem removida com sucesso!' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Erro ao remover imagem' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemoverPendingImage = (index) => {
        setPendingImages(prev => {
            const newList = prev.filter((_, i) => i !== index);
            // Liberar URL do objeto removido
            if (prev[index]?.preview) {
                URL.revokeObjectURL(prev[index].preview);
            }
            return newList;
        });
        setMessage({ type: 'success', text: 'Imagem removida da lista!' });
    };

    const formatarTamanhoArquivo = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Funções de preview de imagem
    const handlePreviewImagem = (imagem) => {
        setPreviewImage({
            url: imagem.urlImagem,
            nome: imagem.nomeArquivo,
            tamanho: imagem.tamanhoArquivo
        });
    };

    const handlePreviewPendingImage = (img) => {
        setPreviewImage({
            url: img.preview,
            nome: img.name,
            tamanho: img.size
        });
    };

    const handleClosePreview = () => {
        setPreviewImage(null);
    };

    const handleGerarPDF = async () => {
        if (!orcamentoID) {
            setMessage({ type: 'error', text: 'Selecione um orçamento para gerar o PDF!' });
            return;
        }

        setLoading(true);
        try {
            // Chamar o backend para gerar o PDF
            const pdfBlob = await orcamentoService.gerarPdf(orcamentoID);
            
            // Criar URL temporária para o blob
            const url = window.URL.createObjectURL(pdfBlob);
            
            // Criar link temporário para download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orcamento_${orcamentoID}_${movimento.replace(/\//g, '-')}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            // Limpar
            link.remove();
            window.URL.revokeObjectURL(url);
            
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
            <ModalPesquisaItens
                isOpen={modalItensAberto}
                onClose={() => setModalItensAberto(false)}
                onSelect={handleAdicionarItem}
            />

            <div className={headerStyles.header}>
                <div className={headerStyles.headerTop}>
                    <div className={headerStyles.headerTitle}>
                        <span></span>
                        <h2>Orçamentos</h2>
                    </div>
                </div>

                <div className={headerStyles.headerControls}>
                    <div className={headerStyles.quickSearchGroup}>
                        <button
                            className={headerStyles.searchIconButton}
                            onClick={() => setShowFilters(true)}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Abrir filtros de pesquisa"
                        >
                            <Search size={20} />
                        </button>
                        <input
                            type="text"
                            className={headerStyles.quickSearchInput}
                            placeholder="ID..."
                            value={quickSearchId}
                            onChange={(e) => setQuickSearchId(e.target.value)}
                            onKeyPress={handleQuickSearchById}
                            disabled={loading || modo !== 'visualizacao'}
                            title="Digite o ID e pressione Enter"
                        />
                        {modo === 'visualizacao' && (
                            <div className={headerStyles.headerActionButtons}>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnNew}`}
                                    onClick={handleGerarPDF}
                                    disabled={loading || !orcamentoID}
                                    title="Gerar PDF do orçamento"
                                >
                                    <Printer size={18} /> PDF
                                </button>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnEdit}`}
                                    onClick={handleEditar}
                                    disabled={loading || !orcamentoID}
                                    title="Editar orçamento"
                                >
                                    <Edit2 size={18} /> EDITAR
                                </button>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnNew}`}
                                    onClick={handleNovo}
                                    disabled={loading}
                                    title="Criar novo orçamento"
                                >
                                    <Plus size={18} /> NOVO
                                </button>
                            </div>
                        )}
                        {modo === 'edicao' && (
                            <div className={headerStyles.headerActionButtons}>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnSave}`}
                                    onClick={handleSave}
                                    disabled={loading}
                                    title="Salvar alterações"
                                >
                                    <Save size={18} /> SALVAR
                                </button>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnDelete}`}
                                    onClick={handleDeleteClick}
                                    disabled={loading || !orcamentoID}
                                    title="Excluir orçamento"
                                >
                                    <Trash2 size={18} /> EXCLUIR
                                </button>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnCancel}`}
                                    onClick={handleCancelar}
                                    disabled={loading}
                                    title="Cancelar edição"
                                >
                                    <X size={18} /> CANCELAR
                                </button>
                            </div>
                        )}
                        {modo === 'criacao' && (
                            <div className={headerStyles.headerActionButtons}>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnSave}`}
                                    onClick={handleSave}
                                    disabled={loading}
                                    title="Salvar novo orçamento"
                                >
                                    <Save size={18} /> SALVAR
                                </button>
                                <button
                                    className={`${headerStyles.headerBtn} ${headerStyles.headerBtnCancel}`}
                                    onClick={handleCancelar}
                                    disabled={loading}
                                    title="Cancelar criação"
                                >
                                    <X size={18} /> CANCELAR
                                </button>
                            </div>
                        )}
                    </div>

                    {orcamentos.length > 0 && modo === 'visualizacao' && (
                        <div className={styles.navigationGroup}>
                            <button
                                className={styles.navButton}
                                onClick={handleFirst}
                                disabled={currentIndex <= 0 || loading}
                                title="Primeiro registro"
                            >
                                <ChevronFirst size={20} />
                            </button>
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
                            <button
                                className={styles.navButton}
                                onClick={handleLast}
                                disabled={currentIndex >= orcamentos.length - 1 || loading}
                                title="Último registro"
                            >
                                <ChevronLast size={20} />
                            </button>
                        </div>
                    )}
                    {(modo === 'edicao' || modo === 'criacao') && (
                        <div className={styles.navigationGroup} style={{ opacity: 0.5 }}>
                            <button className={styles.navButton} disabled title="Primeiro registro">
                                <ChevronFirst size={20} />
                            </button>
                            <button className={styles.navButton} disabled title="Anterior">
                                <ChevronLeft size={20} />
                            </button>
                            <span className={styles.positionIndicator}>
                                {currentIndex >= 0 ? `${currentIndex + 1}/${orcamentos.length}` : `0/${orcamentos.length}`}
                            </span>
                            <button className={styles.navButton} disabled title="Próximo">
                                <ChevronRight size={20} />
                            </button>
                            <button className={styles.navButton} disabled title="Último registro">
                                <ChevronLast size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ModalPesquisaComum
                isOpen={showFilters && modo === 'visualizacao'}
                onClose={() => setShowFilters(false)}
                titulo="Pesquisa de Orçamentos"
                termo={termoPesquisa}
                onTermoChange={setTermoPesquisa}
                campoSelecionado={campoSelecionado}
                onCampoChange={setCampoSelecionado}
                campos={camposPesquisaOrcamento}
                onPesquisar={handlePesquisar}
                onLimpar={handleLimparPesquisa}
                resultados={resultados}
                mostrarResultados={mostrarResultados && modo === 'visualizacao'}
                onSelecionar={(orcamento) => {
                    const index = orcamentos.findIndex(o => o.orcamentoID === orcamento.orcamentoID);
                    selecionarOrcamento(orcamento, index);
                    handleSelecionarResultado(orcamento);
                    setShowFilters(false);
                }}
                colunas={[
                    { campo: 'orcamentoID', label: 'ID' },
                    { campo: 'descricao', label: 'Descrição' },
                    { campo: 'empresaID', label: 'Empresa' },
                    { campo: 'idPrestador', label: 'Prestador' },
                    { campo: 'tipoPagamento', label: 'Tipo Pgto' }
                ]}
                multiFiltro={true}
                dados={orcamentos}
            />


            <div className={styles.form}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.idField}`}>
                        <label>ID ORÇAMENTO</label>
                        <input type="text" value={orcamentoID || ''} disabled placeholder="Automático" />
                    </div>

                    <div className={styles.formGroup}>
                        <label>MOVIMENTO *</label>
                        <div className={styles.inputFieldGroup}>
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
                                <span className={styles.fieldDisplay}>
                                    Data selecionada: {movimento}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>ID PRESTADOR *</label>
                        <div className={styles.inputFieldGroup}>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    value={idPrestador || ''}
                                    onChange={(e) => {
                                        setIdPrestador(e.target.value);
                                        if (!e.target.value) {
                                            setNomePrestador('');
                                        }
                                    }}
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
                            {nomePrestador && (
                                <span className={styles.fieldDisplay}>
                                     {nomePrestador}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>EMPRESA ID *</label>
                        <div className={styles.inputFieldGroup}>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    value={empresaID || ''}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        setEmpresaID(valor);
                                        if (!valor) {
                                            setNomeEmpresa('');
                                        } else {
                                            // Buscar empresa pelo ID digitado
                                            empresaService.obter(parseInt(valor, 10))
                                                .then(empresa => {
                                                    // O campo correto é 'razao' ou 'nome', não 'razaoSocial'
                                                    setNomeEmpresa(empresa.razao || empresa.nome || '');
                                                })
                                                .catch(error => {
                                                    console.error('Erro ao buscar empresa:', error);
                                                    setNomeEmpresa('');
                                                });
                                        }
                                    }}
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
                            {nomeEmpresa && (
                                <span className={styles.fieldDisplay}>
                                    {nomeEmpresa}
                                </span>
                            )}
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

                    <div className={styles.formGroup}>
                        <label>TIPO DE PAGAMENTO</label>
                        <select
                            value={tipoPagamento || ''}
                            onChange={(e) => setTipoPagamento(e.target.value)}
                            disabled={camposDesabilitados}
                            className={styles.select}
                        >
                            <option value="">Selecione...</option>
                            <option value="A_VISTA">À Vista</option>
                            <option value="ANTECIPADO">Antecipado</option>
                            <option value="CINQUENTA_CINQUENTA">50% - 50%</option>
                        </select>
                    </div>
                </div>

                {/* Seção de Itens do Orçamento */}
                <div className={styles.itensSection}>
                    <div className={styles.itensHeader}>
                        <h3>Itens do Orçamento</h3>
                        {!camposDesabilitados && (
                            <button
                                className={styles.btnAddItem}
                                onClick={() => setModalItensAberto(true)}
                                disabled={loading}
                                type="button"
                            >
                                <Plus size={16} /> Adicionar Item
                            </button>
                        )}
                    </div>

                    {itensOrcamento.length > 0 ? (
                        <table className={styles.itensTable}>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Descrição</th>
                                    <th>Tipo</th>
                                    <th>Preço Médio</th>
                                    <th>Valor sem Desconto</th>
                                    <th>Valor com Desconto</th>
                                    <th>Quantidade</th>
                                    <th>Valor Total</th>
                                    {!camposDesabilitados && <th>Ações</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {itensOrcamento.map((item, index) => (
                                    <tr key={index}>
                                        <td><strong>{item.itemNome}</strong></td>
                                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.descricao || ''}>
                                            {item.descricao || '-'}
                                        </td>
                                        <td>
                                            <span style={{ 
                                                backgroundColor: '#e3f2fd', 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}>
                                                {item.tipoUnitario === 'UNIDADE' ? 'un' : 
                                                 item.tipoUnitario === 'METRO_CUBICO' ? 'm³' :
                                                 item.tipoUnitario === 'METRO_QUADRADO' ? 'm²' :
                                                 item.tipoUnitario === 'METRO' ? 'm' :
                                                 item.tipoUnitario === 'CENTIMETRO' ? 'cm' :
                                                 item.tipoUnitario === 'QUILOGRAMA' ? 'kg' :
                                                 item.tipoUnitario === 'GRAMA' ? 'g' :
                                                 item.tipoUnitario === 'LITRO' ? 'L' :
                                                 item.tipoUnitario === 'MILILITRO' ? 'ml' :
                                                 item.tipoUnitario === 'PACOTE' ? 'pct' :
                                                 item.tipoUnitario === 'CAIXA' ? 'cx' :
                                                 item.tipoUnitario === 'GALAO' ? 'gal' :
                                                 item.tipoUnitario === 'TAMBOR' ? 'tmb' :
                                                 item.tipoUnitario === 'ROLO' ? 'rl' :
                                                 item.tipoUnitario === 'PAR' ? 'par' : 'un'}
                                            </span>
                                        </td>
                                        <td>{formatarValor(item.precoMedio)}</td>
                                        <td style={{ textDecoration: item.valorComDesconto ? 'line-through' : 'none', color: item.valorComDesconto ? '#999' : '#000' }}>
                                            {formatarValor(item.valorUnitarioOriginal || item.valorUnitario)}
                                        </td>
                                        <td style={{ fontWeight: 'bold', color: item.valorComDesconto ? '#4CAF50' : '#000' }}>
                                            {item.valorComDesconto ? formatarValor(item.valorComDesconto) : formatarValor(item.valorUnitario)}
                                        </td>
                                        <td>
                                            {camposDesabilitados ? (
                                                item.quantidade
                                            ) : (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantidade}
                                                    onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                                                    className={styles.quantidadeInput}
                                                />
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>{formatarValor(item.valorTotal)}</td>
                                        {!camposDesabilitados && (
                                            <td>
                                                <button
                                                    className={styles.btnRemoveItem}
                                                    onClick={() => handleRemoverItem(index)}
                                                    type="button"
                                                    title="Remover item"
                                                >
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        width="16" 
                                                        height="16" 
                                                        viewBox="0 0 24 24" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        strokeWidth="2" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round"
                                                    >
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.noItens}>Nenhum item adicionado ao orçamento.</p>
                    )}
                </div>

                {/* Resumo Financeiro */}
                <div className={styles.resumoSection}>
                    <div className={styles.resumoGrid}>
                        <div className={styles.formGroup}>
                            <label>VALOR TOTAL DOS ITENS</label>
                            <input
                                type="text"
                                value={formatarValor(valorTotalItens)}
                                disabled
                                className={styles.valorDestaque}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>DESCONTO</label>
                            <input
                                type="number"
                                step="0.01"
                                value={desconto || ''}
                                onChange={(e) => handleDescontoChange(e.target.value)}
                                placeholder="0,00"
                                disabled={camposDesabilitados}
                            />
                        </div>
                        <div className={`${styles.formGroup} ${styles.valorFinalGroup}`}>
                            <label>VALOR FINAL</label>
                            <input
                                type="text"
                                value={formatarValor(valorFinal)}
                                disabled
                                className={styles.valorFinal}
                            />
                        </div>
                    </div>
                </div>

                {/* Seção de Imagens */}
                <div className={styles.imagensSection}>
                    <div className={styles.imagensHeader}>
                        <h3><Image size={20} /> Imagens Anexadas</h3>
                        {(modo === 'edicao' || modo === 'criacao') && (
                            <div className={styles.uploadArea}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    style={{ display: 'none' }}
                                    id="imagem-upload"
                                />
                                <label 
                                    htmlFor="imagem-upload" 
                                    className={`${styles.btnUpload} ${loading ? styles.disabled : ''}`}
                                >
                                    <Upload size={16} /> Anexar Imagem
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Imagens pendentes (modo criação) */}
                    {modo === 'criacao' && pendingImages.length > 0 && (
                        <div className={styles.imagensGrid}>
                            {pendingImages.map((img, index) => (
                                <div key={`pending-${index}`} className={styles.imagemCard}>
                                    <div className={styles.imagemPreview}>
                                        <img 
                                            src={img.preview} 
                                            alt={img.name}
                                        />
                                    </div>
                                    <div className={styles.imagemInfo}>
                                        <span className={styles.imagemNome} title={img.name}>
                                            {img.name.length > 20 
                                                ? img.name.substring(0, 17) + '...' 
                                                : img.name}
                                        </span>
                                        <span className={styles.imagemTamanho}>
                                            {formatarTamanhoArquivo(img.size)}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.btnPreviewImagem}
                                        onClick={() => handlePreviewPendingImage(img)}
                                        type="button"
                                        title="Visualizar imagem"
                                    >
                                        <ZoomIn size={16} color="white" strokeWidth={2.5} />
                                    </button>
                                    <button
                                        className={styles.btnRemoveImagem}
                                        onClick={() => handleRemoverPendingImage(index)}
                                        type="button"
                                        title="Remover imagem"
                                    >
                                        <X size={16} color="white" strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Imagens salvas (modo edição/visualização) */}
                    {imagens.length > 0 ? (
                        <div className={styles.imagensGrid}>
                            {imagens.map((imagem) => (
                                <div key={imagem.idImagem} className={styles.imagemCard}>
                                    <div className={styles.imagemPreview}>
                                        <img 
                                            src={imagem.urlImagem} 
                                            alt={imagem.nomeArquivo}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23666" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                                            }}
                                        />
                                    </div>
                                    <div className={styles.imagemInfo}>
                                        <span className={styles.imagemNome} title={imagem.nomeArquivo}>
                                            {imagem.nomeArquivo.length > 20 
                                                ? imagem.nomeArquivo.substring(0, 17) + '...' 
                                                : imagem.nomeArquivo}
                                        </span>
                                        <span className={styles.imagemTamanho}>
                                            {formatarTamanhoArquivo(imagem.tamanhoArquivo)}
                                        </span>
                                    </div>
                                    <button
                                        className={styles.btnPreviewImagem}
                                        onClick={() => handlePreviewImagem(imagem)}
                                        type="button"
                                        title="Visualizar imagem"
                                    >
                                        <ZoomIn size={16} color="white" strokeWidth={2.5} />
                                    </button>
                                    {(modo === 'edicao' || modo === 'criacao') && (
                                        <button
                                            className={styles.btnRemoveImagem}
                                            onClick={() => handleRemoverImagem(imagem.idImagem)}
                                            type="button"
                                            title="Remover imagem"
                                        >
                                            <X size={16} color="white" strokeWidth={2.5} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        modo !== 'criacao' && (
                            <p className={styles.noImagens}>
                                {modo === 'visualizacao' 
                                    ? 'Clique em "Editar" para anexar imagens.' 
                                    : 'Nenhuma imagem anexada ao orçamento. Clique em "Anexar Imagem" para adicionar.'}
                            </p>
                        )
                    )}

                    {/* Mensagem quando não há imagens em modo criação */}
                    {modo === 'criacao' && pendingImages.length === 0 && (
                        <p className={styles.noImagens}>
                            Clique em "Anexar Imagem" para adicionar imagens ao orçamento.
                        </p>
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

            {/* Modal de Preview de Imagem */}
            {previewImage && (
                <div className={styles.previewModal} onClick={handleClosePreview}>
                    <div className={styles.previewModalContent} onClick={(e) => e.stopPropagation()}>
                        <button
                            className={styles.previewModalClose}
                            onClick={handleClosePreview}
                            type="button"
                            title="Fechar"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#333"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <img
                            src={previewImage.url}
                            alt={previewImage.nome}
                            className={styles.previewModalImage}
                        />
                        <div className={styles.previewModalInfo}>
                            <strong>{previewImage.nome}</strong><br />
                            {formatarTamanhoArquivo(previewImage.tamanho)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrcamentoCadastro;
