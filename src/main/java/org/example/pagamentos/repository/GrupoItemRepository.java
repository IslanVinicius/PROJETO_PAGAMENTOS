package org.example.pagamentos.repository;

import org.example.pagamentos.model.GrupoItemModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GrupoItemRepository extends JpaRepository<GrupoItemModel, Long> {

    /**
     * Busca todos os grupos criados por um usuário específico
     */
    List<GrupoItemModel> findByUsuarioCriador(Usuario usuarioCriador);

    /**
     * Busca um grupo específico, verificando se pertence ao usuário
     */
    Optional<GrupoItemModel> findByIdGrupoAndUsuarioCriador(Long idGrupo, Usuario usuarioCriador);

    /**
     * Busca grupos pelo nome (containing)
     */
    List<GrupoItemModel> findByNomeContainingIgnoreCase(String nome);
}
