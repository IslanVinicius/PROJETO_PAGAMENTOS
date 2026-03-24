package org.example.pagamentos.repository;

import org.example.pagamentos.model.GrupoItemModel;
import org.example.pagamentos.model.ItemModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<ItemModel, Long> {

    /**
     * Busca todos os itens de um grupo específico
     */
    List<ItemModel> findByGrupo(GrupoItemModel grupo);

    /**
     * Busca todos os itens criados por um usuário específico
     */
    List<ItemModel> findByUsuarioCriador(Usuario usuarioCriador);

    /**
     * Busca um item específico, verificando se pertence ao usuário
     */
    Optional<ItemModel> findByIdItemAndUsuarioCriador(Long idItem, Usuario usuarioCriador);

    /**
     * Busca itens pelo nome (containing)
     */
    List<ItemModel> findByNomeContainingIgnoreCase(String nome);

    /**
     * Busca todos os itens de um grupo específico pelo ID do grupo
     */
    List<ItemModel> findByGrupo_IdGrupo(Long idGrupo);
}
