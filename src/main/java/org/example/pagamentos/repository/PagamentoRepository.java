package org.example.pagamentos.repository;

import org.example.pagamentos.model.PagamentoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagamentoRepository extends JpaRepository<PagamentoModel, Long> {
    boolean existsBySolicitacaoAprovacaoSolicitacaoAprovacaoID(Long id);
}
