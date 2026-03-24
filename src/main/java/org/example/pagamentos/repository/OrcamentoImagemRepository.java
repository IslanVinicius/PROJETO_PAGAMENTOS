package org.example.pagamentos.repository;

import org.example.pagamentos.model.OrcamentoImagemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrcamentoImagemRepository extends JpaRepository<OrcamentoImagemModel, Long> {
    List<OrcamentoImagemModel> findByOrcamento_OrcamentoID(Long orcamentoId);
    void deleteByOrcamento_OrcamentoID(Long orcamentoId);
}
