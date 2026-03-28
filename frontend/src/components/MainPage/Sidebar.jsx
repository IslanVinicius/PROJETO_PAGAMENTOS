import { useAuth } from "../../contexts/AuthContext";
import { Building2, Users, CreditCard, FileText, ClipboardCheck, CheckSquare, LogOut, Home, FolderOpen, Package, MapPin } from 'lucide-react';
import styles from "./Sidebar.module.css";

function Sidebar({ activePage, onPageChange, onLogout }) {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
      </div>

      <div className={styles.menu}>
        {role === "ROLE_ADMIN" && (
          <>
            <div
              className={`${styles.menuItem} ${
                activePage === "empresa" ? styles.active : ""
              }`}
              onClick={() => onPageChange("empresa")}
              title="Gerenciar empresas"
            >
              <Building2 size={20} />
              <span>Empresas</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "prestador" ? styles.active : ""
              }`}
              onClick={() => onPageChange("prestador")}
              title="Gerenciar prestadores"
            >
              <Users size={20} />
              <span>Prestadores</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "dadosBancarios" ? styles.active : ""
              }`}
              onClick={() => onPageChange("dadosBancarios")}
              title="Dados bancários"
            >
              <CreditCard size={20} />
              <span>Dados Bancários</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "orcamento" ? styles.active : ""
              }`}
              onClick={() => onPageChange("orcamento")}
              title="Gerar orçamentos"
            >
              <FileText size={20} />
              <span>Orçamentos</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "pedidoAprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("pedidoAprovacao")}
              title="Solicitações de aprovação"
            >
              <ClipboardCheck size={20} />
              <span>Solicitações</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "aprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("aprovacao")}
              title="Aprovar orçamentos"
            >
              <CheckSquare size={20} />
              <span>Aprovações</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "usuario" ? styles.active : ""
              }`}
              onClick={() => onPageChange("usuario")}
              title="Gerenciar usuários"
            >
              <Users size={20} />
              <span>Usuários</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "grupoItens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("grupoItens")}
              title="Gerenciar grupos de itens"
            >
              <FolderOpen size={20} />
              <span>Grupos de Itens</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "itens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("itens")}
              title="Gerenciar itens"
            >
              <Package size={20} />
              <span>Itens</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "enderecos" ? styles.active : ""
              }`}
              onClick={() => onPageChange("enderecos")}
              title="Gerenciar endereços"
            >
              <MapPin size={20} />
              <span>Endereços</span>
            </div>
          </>
        )}

        {role === "ROLE_SOLICITANTE" && (
          <>
            <div
              className={styles.menuItem}
              onClick={() => onPageChange("prestador")}
              title="Cadastro de prestadores"
            >
              <Users size={20} />
              <span>Prestadores</span>
            </div>

            <div
              className={styles.menuItem}
              onClick={() => onPageChange("orcamento")}
              title="Gerar orçamentos"
            >
              <FileText size={20} />
              <span>Orçamentos</span>
            </div>
          </>
        )}

        {role === "ROLE_ESCRITORIO" && (
          <>
            <div
              className={`${styles.menuItem} ${
                activePage === "orcamento" ? styles.active : ""
              }`}
              onClick={() => onPageChange("orcamento")}
              title="Gerar orçamentos"
            >
              <FileText size={20} />
              <span>Orçamentos</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "pedidoAprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("pedidoAprovacao")}
              title="Solicitações de aprovação"
            >
              <ClipboardCheck size={20} />
              <span>Solicitações</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "grupoItens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("grupoItens")}
              title="Gerenciar grupos de itens"
            >
              <FolderOpen size={20} />
              <span>Grupos de Itens</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "itens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("itens")}
              title="Gerenciar itens"
            >
              <Package size={20} />
              <span>Itens</span>
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "enderecos" ? styles.active : ""
              }`}
              onClick={() => onPageChange("enderecos")}
              title="Gerenciar endereços"
            >
              <MapPin size={20} />
              <span>Endereços</span>
            </div>
          </>
        )}

        {role === "ROLE_APROVADOR" && (
          <div
            className={styles.menuItem}
            onClick={() => onPageChange("aprovacao")}
            title="Aprovar orçamentos"
          >
            <CheckSquare size={20} />
            <span>Aprovações</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.logoutBtn} onClick={onLogout} title="Fazer logout">
          <LogOut size={20} />
          <span>Sair</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;