package org.example.pagamentos.repository;

import org.example.pagamentos.model.OrcamentoItemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrcamentoItemRepository extends JpaRepository<OrcamentoItemModel, Long> {
    List<OrcamentoItemModel> findByOrcamento_OrcamentoID(Long orcamentoId);
    void deleteByOrcamento_OrcamentoID(Long orcamentoId);
    List<OrcamentoItemModel> findByItem_IdItem(Long itemId);
}
