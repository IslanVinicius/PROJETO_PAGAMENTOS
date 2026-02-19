import React from "react";
import styles from "./Sidebar.module.css";

function Sidebar({ activePage, onPageChange, onLogout }) {
    // Separando os menus por categoria
    const menuSections = [
        {
            title: "CADASTROS",
            items: [
                { id: "prestador", icon: "👤", label: "Cadastro de Prestador", iconClass: styles.iconCadastro },
                { id: "empresa", icon: "🏢", label: "Cadastro de Empresa", iconClass: styles.iconCadastro },
                { id: "dadosBancarios", icon: "🏦", label: "Dados Bancários", iconClass: styles.iconCadastro}
            ]
        },
        {
            title: "ORÇAMENTOS",
            items: [
                { id: "orcamento", icon: "💰", label: "Gerar Orçamento", iconClass: styles.iconOrcamento }
            ]
        },
        {
            title: "PEDIDOS",
            items: [
                { id: "pedidoAprovacao", icon: "📋", label: "Gerar Pedido de Aprovação", iconClass: styles.iconPedido },
                { id: "aprovacao", icon: "✅", label: "Aprovar Solicitações", iconClass: styles.iconPedido }
            ]
        }
    ];

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    💳 <span>SISTEMA DE PAGAMENTOS</span>
                </div>
            </div>

            <div className={styles.user}>
                <div className={styles.avatar}>👤</div>
                <div className={styles.name}>Usuário Teste</div>
                <div className={styles.email}>usuario@email.com</div>
            </div>

            <div className={styles.menu}>
                {menuSections.map((section, index) => (
                    <div key={index} className={styles.menuSection}>
                        <div className={styles.sectionTitle}>{section.title}</div>
                        {section.items.map(item => (
                            <div
                                key={item.id}
                                className={`${styles.menuItem} ${activePage === item.id ? styles.active : ''}`}
                                onClick={() => onPageChange(item.id)}
                            >
                                <span className={item.iconClass || styles.icon}>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles.footer}>
                <div className={styles.logoutBtn} onClick={onLogout}>
                    <span className={styles.icon}>🚪</span>
                    <span>Sair</span>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;