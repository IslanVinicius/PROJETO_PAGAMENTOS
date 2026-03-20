package org.example.pagamentos.repository;

import org.example.pagamentos.model.PrestadorModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrestadorRepository extends JpaRepository<PrestadorModel, Long> {
    
    /**
     * Busca todos os prestadores criados por um usuário específico
     */
    List<PrestadorModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca um prestador específico, verificando se pertence ao usuário
     */
    Optional<PrestadorModel> findByCodPrestadorAndUsuarioCriador(Long codPrestador, Usuario usuarioCriador);
}
