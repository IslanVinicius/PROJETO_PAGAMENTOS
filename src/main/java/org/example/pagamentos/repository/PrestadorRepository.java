package org.example.pagamentos.repository;

import org.example.pagamentos.model.PrestadorModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrestadorRepository extends JpaRepository<PrestadorModel, Long> {
}
