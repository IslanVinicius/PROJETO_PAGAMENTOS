import React, { useState } from "react";
import Sidebar from "./Sidebar";
import EmpresaCadastro from "./EmpresaCadastro";
import styles from "./MainPage.module.css";
import PrestadorCadastro from './PrestadorCadastro';
import DadosBancariosCadastro from './DadosBancariosCadastro';
import OrcamentoCadastro from './OrcamentoCadastro';
import SolicitacaoAprovacaoCadastro from './SolicitacaoAprovacaoCadastro';
import AprovacaoCadastro from './AprovacaoCadastro';

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

            case "dadosBancarios":
                return <DadosBancariosCadastro />;

            case "orcamento":
                return (
                    <OrcamentoCadastro />
                );

            case "pedidoAprovacao":
                return <SolicitacaoAprovacaoCadastro />;

            case "aprovacao":
                return <AprovacaoCadastro />;

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