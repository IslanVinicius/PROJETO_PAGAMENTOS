import { useAuth } from "../../contexts/AuthContext";
import { Building2, Users, CreditCard, FileText, ClipboardCheck, CheckSquare, LogOut, FolderOpen, Package, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from "./Sidebar.module.css";
import { useState, useEffect } from "react";

function Sidebar({ activePage, onPageChange, onLogout, onToggleSidebar }) {
  const { user } = useAuth();
  const role = user?.role;
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Controla expansão baseada no hover
  const handleMouseEnter = () => {
    setIsHovering(true);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Delay para colapsar após sair do hover
    setTimeout(() => {
      if (!isHovering) {
        setIsExpanded(false);
      }
    }, 300);
  };

  // Toggle manual com clique no botão
  const handleToggleClick = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Notifica o componente pai sobre mudanças no estado de expansão
  useEffect(() => {
    if (onToggleSidebar) {
      onToggleSidebar(isExpanded);
    }
  }, [isExpanded, onToggleSidebar]);

  return (
    <div 
      className={`${styles.sidebar} ${!isExpanded ? styles.collapsed : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.header}>
        <img src="/logo.png" alt="Logo" className={styles.logoImage} />
        {isExpanded && <span className={styles.logoText}>Sistema de Orçamentos</span>}
        <button 
          className={styles.toggleButton}
          onClick={handleToggleClick}
          title={isExpanded ? "Recolher menu" : "Expandir menu"}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <div className={styles.menu}>
        {role === "ROLE_ADMIN" && (
          <>
            <div
              className={`${styles.menuItem} ${
                activePage === "empresa" ? styles.active : ""
              }`}
              onClick={() => onPageChange("empresa")}
              title={isExpanded ? "Gerenciar empresas" : "Empresas"}
            >
              <Building2 size={20} />
              {isExpanded && <span>Empresas</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "prestador" ? styles.active : ""
              }`}
              onClick={() => onPageChange("prestador")}
              title={isExpanded ? "Gerenciar prestadores" : "Prestadores"}
            >
              <Users size={20} />
              {isExpanded && <span>Prestadores</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "dadosBancarios" ? styles.active : ""
              }`}
              onClick={() => onPageChange("dadosBancarios")}
              title={isExpanded ? "Dados bancários" : "Dados Bancários"}
            >
              <CreditCard size={20} />
              {isExpanded && <span>Dados Bancários</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "orcamento" ? styles.active : ""
              }`}
              onClick={() => onPageChange("orcamento")}
              title={isExpanded ? "Gerar orçamentos" : "Orçamentos"}
            >
              <FileText size={20} />
              {isExpanded && <span>Orçamentos</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "pedidoAprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("pedidoAprovacao")}
              title={isExpanded ? "Solicitações de aprovação" : "Solicitações"}
            >
              <ClipboardCheck size={20} />
              {isExpanded && <span>Solicitações</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "aprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("aprovacao")}
              title={isExpanded ? "Aprovar orçamentos" : "Aprovações"}
            >
              <CheckSquare size={20} />
              {isExpanded && <span>Aprovações</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "usuario" ? styles.active : ""
              }`}
              onClick={() => onPageChange("usuario")}
              title={isExpanded ? "Gerenciar usuários" : "Usuários"}
            >
              <Users size={20} />
              {isExpanded && <span>Usuários</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "grupoItens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("grupoItens")}
              title={isExpanded ? "Gerenciar grupos de itens" : "Grupos de Itens"}
            >
              <FolderOpen size={20} />
              {isExpanded && <span>Grupos de Itens</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "itens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("itens")}
              title={isExpanded ? "Gerenciar itens" : "Itens"}
            >
              <Package size={20} />
              {isExpanded && <span>Itens</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "enderecos" ? styles.active : ""
              }`}
              onClick={() => onPageChange("enderecos")}
              title={isExpanded ? "Gerenciar endereços" : "Endereços"}
            >
              <MapPin size={20} />
              {isExpanded && <span>Endereços</span>}
            </div>
          </>
        )}

        {role === "ROLE_SOLICITANTE" && (
          <>
            <div
              className={styles.menuItem}
              onClick={() => onPageChange("prestador")}
              title={isExpanded ? "Cadastro de prestadores" : "Prestadores"}
            >
              <Users size={20} />
              {isExpanded && <span>Prestadores</span>}
            </div>

            <div
              className={styles.menuItem}
              onClick={() => onPageChange("orcamento")}
              title={isExpanded ? "Gerar orçamentos" : "Orçamentos"}
            >
              <FileText size={20} />
              {isExpanded && <span>Orçamentos</span>}
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
              title={isExpanded ? "Gerar orçamentos" : "Orçamentos"}
            >
              <FileText size={20} />
              {isExpanded && <span>Orçamentos</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "pedidoAprovacao" ? styles.active : ""
              }`}
              onClick={() => onPageChange("pedidoAprovacao")}
              title={isExpanded ? "Solicitações de aprovação" : "Solicitações"}
            >
              <ClipboardCheck size={20} />
              {isExpanded && <span>Solicitações</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "grupoItens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("grupoItens")}
              title={isExpanded ? "Gerenciar grupos de itens" : "Grupos de Itens"}
            >
              <FolderOpen size={20} />
              {isExpanded && <span>Grupos de Itens</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "itens" ? styles.active : ""
              }`}
              onClick={() => onPageChange("itens")}
              title={isExpanded ? "Gerenciar itens" : "Itens"}
            >
              <Package size={20} />
              {isExpanded && <span>Itens</span>}
            </div>

            <div
              className={`${styles.menuItem} ${
                activePage === "enderecos" ? styles.active : ""
              }`}
              onClick={() => onPageChange("enderecos")}
              title={isExpanded ? "Gerenciar endereços" : "Endereços"}
            >
              <MapPin size={20} />
              {isExpanded && <span>Endereços</span>}
            </div>
          </>
        )}

        {role === "ROLE_APROVADOR" && (
          <div
            className={styles.menuItem}
            onClick={() => onPageChange("aprovacao")}
            title={isExpanded ? "Aprovar orçamentos" : "Aprovações"}
          >
            <CheckSquare size={20} />
            {isExpanded && <span>Aprovações</span>}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div 
          className={styles.logoutBtn} 
          onClick={onLogout} 
          title={isExpanded ? "Fazer logout" : "Sair"}
        >
          <LogOut size={20} />
          {isExpanded && <span>Sair</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
