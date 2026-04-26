import React from 'react';
import styles from './ApprovalModal.module.css';
import { CheckCircle, XCircle, Building2, User, FileText, Image as ImageIcon, DollarSign } from 'lucide-react';

function ApprovalModal({ isOpen, onClose, mode = 'approve', orcamento, empresa, prestador, onConfirm, loading }) {
    if (!isOpen) return null;

    const title = mode === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação';
    const confirmText = mode === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição';

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button className={styles.close} onClick={onClose}>×</button>
                </div>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FileText size={18} />
                            <strong>Orçamento</strong>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.row}><span className={styles.label}>ID</span><span className={styles.value}>#{orcamento?.orcamentoID || orcamento?.id || 'N/A'}</span></div>
                            <div className={styles.row}><span className={styles.label}>Data</span><span className={styles.value}>{orcamento?.movimento ? String(orcamento.movimento) : 'N/A'}</span></div>
                            <div className={styles.row}><span className={styles.label}>Descrição</span><span className={styles.value}>{orcamento?.descricao || '—'}</span></div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <Building2 size={18} />
                            <strong>Empresa</strong>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.row}><span className={styles.label}>Nome</span><span className={styles.value}>{empresa?.nome || empresa?.nomeFantasia || 'N/A'}</span></div>
                            <div className={styles.row}><span className={styles.label}>CNPJ</span><span className={styles.value}>{empresa?.cnpj || 'N/A'}</span></div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <User size={18} />
                            <strong>Prestador</strong>
                        </div>
                        <div className={styles.sectionBody}>
                            <div className={styles.row}><span className={styles.label}>Nome</span><span className={styles.value}>{prestador?.nome || 'N/A'}</span></div>
                            <div className={styles.row}><span className={styles.label}>CPF</span><span className={styles.value}>{prestador?.cpf || 'N/A'}</span></div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <DollarSign size={18} />
                            <strong>Itens</strong>
                        </div>
                        <div className={styles.itemsTable}>
                            {orcamento?.itens && orcamento.itens.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Descrição</th>
                                            <th>Qtd.</th>
                                            <th>Valor Unit.</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orcamento.itens.map((it, idx) => (
                                            <tr key={idx}>
                                                <td>#{it.itemId || it.id || (idx + 1)}</td>
                                                <td>{it.itemNome || it.descricao || it.nome || '—'}</td>
                                                <td style={{ textAlign: 'right' }}>{it.quantidade || it.qtd || 1}</td>
                                                <td style={{ textAlign: 'right' }}>{(Number(it.valorUnitario || it.valorUnit || it.preco || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 700 }}>{(Number(it.valorTotal || it.total || 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.empty}>Nenhum item informado</div>
                            )}
                        </div>
                    </section>

                    {orcamento?.imagens && orcamento.imagens.length > 0 && (
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <ImageIcon size={18} />
                                <strong>Imagens</strong>
                            </div>
                            <div className={styles.imagesRow}>
                                {orcamento.imagens.map((img, i) => (
                                    <div key={img.idImagem || i} className={styles.thumb}>
                                        {img.urlImagem ? <img src={img.urlImagem} alt={`img-${i}`} /> : <div className={styles.empty}>—</div>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancel} onClick={onClose} disabled={loading}>Cancelar</button>
                    <button
                        className={mode === 'approve' ? styles.confirmApprove : styles.confirmReject}
                        onClick={() => onConfirm(mode)}
                        disabled={loading}
                    >
                        {mode === 'approve' ? <><CheckCircle size={16} /> {confirmText}</> : <><XCircle size={16} /> {confirmText}</>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApprovalModal;

