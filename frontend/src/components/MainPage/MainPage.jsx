import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import EmpresaCadastro from "./EmpresaCadastro";
import PrestadorCadastro from "./PrestadorCadastro";
import DadosBancariosCadastro from "./DadosBancariosCadastro";
import OrcamentoCadastro from "./OrcamentoCadastro";
import SolicitacaoAprovacaoCadastro from "./SolicitacaoAprovacaoCadastro";
import AprovacaoCadastro from "./AprovacaoCadastro";
import UserCadastro from "./UserCadastro.jsx"
import GrupoItemCadastro from "./GrupoItemCadastro";
import ItemCadastro from "./ItemCadastro";
import EnderecoCadastro from "./EnderecoCadastro";
import styles from "./MainPage.module.css";
import { useAuth } from "../../contexts/AuthContext";

function MainPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const role = user?.role;
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    // 🔥 Permissões por role
    const rolePermissions = {
        ROLE_ADMIN: [
            "empresa",
            "prestador",
            "dadosBancarios",
            "orcamento",
            "pedidoAprovacao",
            "aprovacao",
            "usuario",
            "grupoItens",
            "itens",
            "enderecos"
        ],
        ROLE_SOLICITANTE: ["prestador", "orcamento"],
        ROLE_ESCRITORIO: ["orcamento", "pedidoAprovacao", "grupoItens", "itens", "enderecos"],
        ROLE_APROVADOR: ["aprovacao"]
    };

    const [activePage, setActivePage] = useState("");

    useEffect(() => {
        if (role && rolePermissions[role]) {
            setActivePage(rolePermissions[role][0]);
        }
    }, [role]);

    // ✅ FUNÇÃO DE LOGOUT (estava faltando)
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const renderContent = () => {
        if (!rolePermissions[role]?.includes(activePage)) {
            return (
                <div className={styles.card}>
                    <div className={styles.header}>
                        <span>🚫</span>
                        <h2>Acesso Negado</h2>
                    </div>
                    <p>Você não tem permissão para acessar esta página.</p>
                </div>
            );
        }

        switch (activePage) {
            case "prestador":
                return <PrestadorCadastro />;

            case "empresa":
                return <EmpresaCadastro />;

            case "dadosBancarios":
                return <DadosBancariosCadastro />;

            case "orcamento":
                return <OrcamentoCadastro />;

            case "pedidoAprovacao":
                return <SolicitacaoAprovacaoCadastro />;

            case "aprovacao":
                return <AprovacaoCadastro />;
            case "usuario":
                return <UserCadastro />;

            case "grupoItens":
                return <GrupoItemCadastro />;

            case "itens":
                return <ItemCadastro />;

            case "enderecos":
                return <EnderecoCadastro />;

            default:
                return (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <span>📊</span>
                            <h2>Dashboard</h2>
                        </div>
                        <p>Selecione uma opção no menu</p>
                    </div>
                );
        }
    };

    return (
        <div className={styles.mainContainer}>
            <Sidebar
                activePage={activePage}
                onPageChange={setActivePage}
                onLogout={handleLogout}
                onToggleSidebar={(expanded) => setSidebarExpanded(expanded)}
            />
            <div className={`${styles.content} ${!sidebarExpanded ? styles.contentExpanded : ''}`}>
                {renderContent()}
            </div>
        </div>
    );
}

export default MainPage;