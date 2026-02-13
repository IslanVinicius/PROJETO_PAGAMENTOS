package org.example.pagamentos.repository;

import org.example.pagamentos.model.EmpresaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmpresaRespository extends JpaRepository<EmpresaModel,Long> {
}
