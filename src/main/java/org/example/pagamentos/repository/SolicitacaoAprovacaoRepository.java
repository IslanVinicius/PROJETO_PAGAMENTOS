package org.example.pagamentos.repository;

import org.example.pagamentos.model.SolicitacaoAprovacaoModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitacaoAprovacaoRepository extends JpaRepository<SolicitacaoAprovacaoModel,Long> {
    
    /**
     * Busca todas as solicitações criadas por um usuário específico
     */
    List<SolicitacaoAprovacaoModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca uma solicitação específica, verificando se pertence ao usuário
     */
    Optional<SolicitacaoAprovacaoModel> findBySolicitacaoAprovacaoIDAndUsuarioCriador(Long solicitacaoAprovacaoID, Usuario usuarioCriador);
}
