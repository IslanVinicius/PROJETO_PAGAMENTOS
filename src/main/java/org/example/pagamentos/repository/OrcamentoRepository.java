package org.example.pagamentos.repository;

import org.example.pagamentos.model.OrcamentoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrcamentoRepository extends JpaRepository<OrcamentoModel, Long> {
}
