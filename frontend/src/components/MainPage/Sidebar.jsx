import { useAuth } from "../../contexts/AuthContext";
import styles from "./Sidebar.module.css";

function Sidebar({ activePage, onPageChange, onLogout }) {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>Sistema Financeiro</div>
      </div>

      <div className={styles.menu}>
        {role === "ROLE_ADMIN" && (
          <>
            <div
              className={`${styles.menuItem} ${
                activePage === "empresa" ? styles.active : ""
              }`}
              onClick={() => onPageChange("empresa")}
            >
              Cadastro Empresa
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "prestador" ? styles.active : ""
              }`}
              onClick={() => onPageChange("prestador")}
            >
              Cadastro Prestador
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "dadosBancarios" ? styles.active : ""
              }`}
              onClick={() => onPageChange("dadosBancarios")}
            >
              Dados Bancários
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "orcamento" ? styles.active : ""
              }`}
              onClick={() => onPageChange("orcamento")}
            >
              Gerar Orçamento
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "pedidoAprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("pedidoAprovacao")}
            >
              Pedido Aprovação
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "aprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("aprovacao")}
            >
              Aprovar Orçamento
            </div>
          </>
        )}

        {role === "ROLE_SOLICITANTE" && (
          <>
            <div
              className={styles.menuItem}
              onClick={() => onPageChange("prestador")}
            >
              Cadastro Prestador
            </div>

            <div
              className={styles.menuItem}
              onClick={() => onPageChange("orcamento")}
            >
              Gerar Orçamento
            </div>
          </>
        )}

        {role === "ROLE_ESCRITORIO" && (
          <>
            <div
              className={styles.menuItem}
              onClick={() => onPageChange("orcamento")}
            >
              Gerar Orçamento
            </div>

            <div
              className={styles.menuItem}
              onClick={() => onPageChange("pedidoAprovacao")}
            >
              Pedido Aprovação
            </div>
          </>
        )}

        {role === "ROLE_APROVADOR" && (
          <div
            className={styles.menuItem}
            onClick={() => onPageChange("aprovacao")}
          >
            Aprovar Orçamento
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.logoutBtn} onClick={onLogout}>
          Sair
        </div>
      </div>
    </div>
  );
}

export default Sidebar;