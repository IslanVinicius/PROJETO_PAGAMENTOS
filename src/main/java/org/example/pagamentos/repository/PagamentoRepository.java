package org.example.pagamentos.repository;

import org.example.pagamentos.model.PagamentoModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<PagamentoModel, Long> {
    boolean existsBySolicitacaoAprovacaoSolicitacaoAprovacaoID(Long id);
    
    /**
     * Busca todos os pagamentos criados por um usuário específico
     */
    List<PagamentoModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca um pagamento específico, verificando se pertence ao usuário
     */
    Optional<PagamentoModel> findByPagamentoIDAndUsuarioCriador(Long pagamentoID, Usuario usuarioCriador);
}
