package org.example.pagamentos.repository;

import org.example.pagamentos.model.Dados_BancariosModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface Dados_Bancarios_Repository extends JpaRepository<Dados_BancariosModel, Long>{

    @Modifying
    @Transactional
    @Query("DELETE FROM Dados_BancariosModel d WHERE d.id = :id")
    void forcedDelete(Long id);

    Optional<Dados_BancariosModel> findByPrestadorModelCodPrestador(Long codPrestador);
    
    /**
     * Busca todos os dados bancários criados por um usuário específico
     */
    List<Dados_BancariosModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca um dado bancário específico, verificando se pertence ao usuário
     */
    Optional<Dados_BancariosModel> findByIdAndUsuarioCriador(Long id, Usuario usuarioCriador);
}
