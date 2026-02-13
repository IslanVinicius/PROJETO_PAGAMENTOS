package org.example.pagamentos.repository;

import org.example.pagamentos.model.Dados_BancariosModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Dados_Bancarios_Repository extends JpaRepository<Dados_BancariosModel, Long>{
}
