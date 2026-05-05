package org.example.pagamentos.repository;

import org.example.pagamentos.model.OrcamentoModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface OrcamentoRepository extends JpaRepository<OrcamentoModel, Long> {

    @Query(value = "SELECT a.* FROM orcamentos a " +
            "LEFT JOIN solicitacoes_aprovacao b ON a.orcamentoid = b.orcamentoid " +
            "WHERE b.status = 'REJEITADO' OR b.status IS NULL",
            nativeQuery = true)
    List<OrcamentoModel> procurarOrcamentosDisponiveis();

    /**
     * Busca todos os orçamentos criados por um usuário específico
     */
    List<OrcamentoModel> findByUsuarioCriador(Usuario usuarioCriador);

    /**
     * Busca um orçamento específico, verificando se pertence ao usuário
     */
    Optional<OrcamentoModel> findByOrcamentoIDAndUsuarioCriador(Long orcamentoID, Usuario usuarioCriador);

    // ===== DASHBOARD QUERIES =====

    /**
     * Retorna KPIs: [totalOrcamentos, valorTotal, valorMedio]
     * Query nativa SQL para suporte melhor a filtros nulos
     */
    @Query(value = "SELECT COUNT(*), COALESCE(SUM(o.VALOR_FINAL), 0), " +
            "CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(o.VALOR_FINAL), 0) / COUNT(*) ELSE 0 END " +
            "FROM ORCAMENTOS o " +
            "WHERE (CAST(:dataInicio AS date) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS date)) " +
            "AND (CAST(:dataFim AS date) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS date))",
            nativeQuery = true)
    Object[] buscarKpis(@Param("dataInicio") LocalDate dataInicio,
                        @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna orçamentos agrupados por empresa: [empresaId, empresaNome, totalOrcamentos, valorTotal]
     */
    @Query(value = "SELECT e.ENTIDADE, e.NOME, COUNT(o.*), COALESCE(SUM(o.VALOR_FINAL), 0) " +
            "FROM ORCAMENTOS o " +
            "JOIN EMPRESAS e ON o.ENTIDADE = e.ENTIDADE " +
            "WHERE (CAST(:dataInicio AS date) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS date)) " +
            "AND (CAST(:dataFim AS date) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS date)) " +
            "GROUP BY e.ENTIDADE, e.NOME " +
            "ORDER BY COUNT(o.*) DESC",
            nativeQuery = true)
    List<Object[]> buscarOrcamentosPorEmpresa(@Param("dataInicio") LocalDate dataInicio,
                                              @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna orçamentos agrupados por prestador: [prestadorId, prestadorNome, totalOrcamentos, valorTotal]
     */
    @Query(value = "SELECT p.COD_PRESTADOR, p.NOME, COUNT(o.*), COALESCE(SUM(o.VALOR_FINAL), 0) " +
            "FROM ORCAMENTOS o " +
            "JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "WHERE (CAST(:dataInicio AS date) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS date)) " +
            "AND (CAST(:dataFim AS date) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS date)) " +
            "GROUP BY p.COD_PRESTADOR, p.NOME " +
            "ORDER BY COUNT(o.*) DESC",
            nativeQuery = true)
    List<Object[]> buscarOrcamentosPorPrestador(@Param("dataInicio") LocalDate dataInicio,
                                                @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna orçamentos agrupados por período (mês/ano): [ano, mes, totalOrcamentos, valorTotal]
     */
    @Query(value = "SELECT EXTRACT(YEAR FROM o.MOVIMENTO)::INTEGER, EXTRACT(MONTH FROM o.MOVIMENTO)::INTEGER, COUNT(o.*), COALESCE(SUM(o.VALOR_FINAL), 0) " +
            "FROM ORCAMENTOS o " +
            "WHERE (CAST(:dataInicio AS date) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS date)) " +
            "AND (CAST(:dataFim AS date) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS date)) " +
            "GROUP BY EXTRACT(YEAR FROM o.MOVIMENTO), EXTRACT(MONTH FROM o.MOVIMENTO) " +
            "ORDER BY EXTRACT(YEAR FROM o.MOVIMENTO) DESC, EXTRACT(MONTH FROM o.MOVIMENTO) DESC",
            nativeQuery = true)
    List<Object[]> buscarOrcamentosPorPeriodo(@Param("dataInicio") LocalDate dataInicio,
                                              @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna empresas disponíveis (DISTINCT) nos orçamentos filtrados
     */
    @Query("SELECT DISTINCT o.empresa.idEmpresa, o.empresa.nome " +
            "FROM OrcamentoModel o " +
            "WHERE (:dataInicio IS NULL OR o.movimento >= :dataInicio) " +
            "AND (:dataFim IS NULL OR o.movimento <= :dataFim) " +
            "ORDER BY o.empresa.nome")
    List<Object[]> buscarEmpresasDisponiveis(@Param("dataInicio") LocalDate dataInicio,
                                             @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna prestadores disponíveis (DISTINCT) nos orçamentos filtrados
     */
    @Query("SELECT DISTINCT o.prestador.codPrestador, o.prestador.nome " +
            "FROM OrcamentoModel o " +
            "WHERE (:dataInicio IS NULL OR o.movimento >= :dataInicio) " +
            "AND (:dataFim IS NULL OR o.movimento <= :dataFim) " +
            "ORDER BY o.prestador.nome")
    List<Object[]> buscarPrestadoresDisponiveis(@Param("dataInicio") LocalDate dataInicio,
                                                @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna tipos de pagamento disponíveis (DISTINCT) nos orçamentos
     */
    @Query("SELECT DISTINCT o.tipoPagamento " +
            "FROM OrcamentoModel o " +
            "WHERE o.tipoPagamento IS NOT NULL " +
            "ORDER BY o.tipoPagamento")
    List<String> buscarTiposPagamentoDisponiveis();
}
