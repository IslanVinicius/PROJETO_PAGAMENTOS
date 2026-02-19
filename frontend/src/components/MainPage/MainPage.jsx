import React, { useState } from "react";
import Sidebar from "./Sidebar";
import EmpresaCadastro from "./EmpresaCadastro";
import styles from "./MainPage.module.css";
import PrestadorCadastro from './PrestadorCadastro';
import DadosBancariosCadastro from './DadosBancariosCadastro';

function MainPage({ onLogout }) {
    const [activePage, setActivePage] = useState("empresa");

    const renderContent = () => {
        switch (activePage) {
            case "prestador":
                return (
                    <PrestadorCadastro />
                );

            case "empresa":
                return <EmpresaCadastro />

            case "orcamento":
                return (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <span>💰</span>
                            <h2>Gerar Orçamento</h2>
                        </div>
                        <p>Em desenvolvimento...</p>
                    </div>
                );

            case "pedidoAprovacao":
                return (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <span>📋</span>
                            <h2>Gerar Pedido de Aprovação</h2>
                        </div>
                        <p>Em desenvolvimento...</p>
                    </div>
                );

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
                onLogout={onLogout}
            />
            <div className={styles.content}>
                {renderContent()}
            </div>
        </div>
    );
}

export default MainPage;