package org.example.pagamentos.repository;

import org.example.pagamentos.model.SolicitacaoAprovacaoModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoAprovacaoRepository extends JpaRepository<SolicitacaoAprovacaoModel,Long> {

}
