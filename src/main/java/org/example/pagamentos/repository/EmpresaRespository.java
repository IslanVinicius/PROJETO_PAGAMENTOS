package org.example.pagamentos.repository;

import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpresaRespository extends JpaRepository<EmpresaModel,Long> {
    
    /**
     * Busca todas as empresas criadas por um usuário específico
     */
    List<EmpresaModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca uma empresa específica, verificando se pertence ao usuário
     */
    Optional<EmpresaModel> findByIdEmpresaAndUsuarioCriador(Long idEmpresa, Usuario usuarioCriador);
}
