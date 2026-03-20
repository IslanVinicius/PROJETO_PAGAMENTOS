package org.example.pagamentos.repository;

import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrcamentoRepository extends JpaRepository<OrcamentoModel, Long> {

    @Query(value = "SELECT a.* FROM orcamentos a " +
            "LEFT JOIN solicitacoes_aprovacao b ON a.orcamentoid = b.orcamentoid " +
            "WHERE b.status = 'REJEITADO' OR b.status IS NULL",
            nativeQuery = true)
    List<OrcamentoModel> procurarOrcamentosDisponiveis();

    /**
     * Busca todos os orçamentos criados por um usuário específico
     */
    List<OrcamentoModel> findByUsuarioCriador(Usuario usuarioCriador);

    /**
     * Busca um orçamento específico, verificando se pertence ao usuário
     */
    Optional<OrcamentoModel> findByOrcamentoIDAndUsuarioCriador(Long orcamentoID, Usuario usuarioCriador);
}
