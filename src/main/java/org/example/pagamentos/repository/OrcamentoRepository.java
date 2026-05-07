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
     * Retorna KPIs do dashboard: [totalOrcamentos, valorTotal, valorMedio]
     */
    @Query(value = "SELECT COUNT(*), COALESCE(SUM(o.VALOR_FINAL), 0), " +
            "CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(o.VALOR_FINAL), 0) / COUNT(*) ELSE 0 END " +
            "FROM ORCAMENTOS o " +
            "WHERE o.MOVIMENTO >= :dataInicio " +
            "AND o.MOVIMENTO <= :dataFim",
            nativeQuery = true)
    Object[] buscarKpis(@Param("dataInicio") LocalDate dataInicio,
                        @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna evolução de orçamentos por período (dia/mês)
     */
    @Query(value = "SELECT DATE_TRUNC('day', o.MOVIMENTO)::date as data, " +
            "COALESCE(SUM(o.VALOR_FINAL), 0) as valor_total, " +
            "COUNT(*) as quantidade " +
            "FROM ORCAMENTOS o " +
            "WHERE o.MOVIMENTO >= :dataInicio " +
            "AND o.MOVIMENTO <= :dataFim " +
            "GROUP BY DATE_TRUNC('day', o.MOVIMENTO)::date " +
            "ORDER BY data ASC",
            nativeQuery = true)
    List<Object[]> buscarEvolucaoPorPeriodo(@Param("dataInicio") LocalDate dataInicio,
                                            @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna ranking de prestadores por valor total
     */
    @Query(value = "SELECT p.COD_PRESTADOR, p.NOME, " +
            "COALESCE(SUM(o.VALOR_FINAL), 0) as valor_total, " +
            "COUNT(o.orcamentoid) as quantidade " +
            "FROM ORCAMENTOS o " +
            "INNER JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "WHERE o.MOVIMENTO >= :dataInicio " +
            "AND o.MOVIMENTO <= :dataFim " +
            "GROUP BY p.COD_PRESTADOR, p.NOME " +
            "ORDER BY valor_total DESC",
            nativeQuery = true)
    List<Object[]> buscarRankingPrestadores(@Param("dataInicio") LocalDate dataInicio,
                                            @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna distribuição por status
     */
    @Query(value = "SELECT COALESCE(sa.STATUS, 'PENDENTE') as status, " +
            "COUNT(*) as quantidade " +
            "FROM ORCAMENTOS o " +
            "LEFT JOIN SOLICITACOES_APROVACAO sa ON o.orcamentoid = sa.orcamentoid " +
            "WHERE o.MOVIMENTO >= :dataInicio " +
            "AND o.MOVIMENTO <= :dataFim " +
            "GROUP BY sa.STATUS " +
            "ORDER BY quantidade DESC",
            nativeQuery = true)
    List<Object[]> buscarDistribuicaoStatus(@Param("dataInicio") LocalDate dataInicio,
                                            @Param("dataFim") LocalDate dataFim);

    /**
     * Retorna últimos orçamentos com detalhes
     */
    @Query(value = "SELECT o.orcamentoid, p.NOME as prestador_nome, " +
            "o.VALOR_FINAL, COALESCE(sa.STATUS, 'PENDENTE') as status, " +
            "o.MOVIMENTO as data_movimento " +
            "FROM ORCAMENTOS o " +
            "INNER JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "LEFT JOIN SOLICITACOES_APROVACAO sa ON o.orcamentoid = sa.orcamentoid " +
            "WHERE o.MOVIMENTO >= :dataInicio " +
            "AND o.MOVIMENTO <= :dataFim " +
            "ORDER BY o.MOVIMENTO DESC " +
            "LIMIT :limite",
            nativeQuery = true)
    List<Object[]> buscarUltimosOrcamentos(@Param("dataInicio") LocalDate dataInicio,
                                           @Param("dataFim") LocalDate dataFim,
                                           @Param("limite") int limite);

    // ===== QUERIES PARA TABELA AVANÇADA DE ORÇAMENTOS =====

    /**
     * Busca orçamentos com filtros avançados e paginação
     */
    @Query(value = "SELECT o.orcamentoid, " +
            "TO_CHAR(o.MOVIMENTO, 'DD/MM/YYYY') as movimento, " +
            "u.username as usuario_criador, " +
            "p.NOME as prestador, " +
            "e.NOME as empresa, " +
            "o.DESCRICAO, " +
            "o.TIPO_PAGAMENTO, " +
            "o.VALOR_FINAL, " +
            "COALESCE(sa.STATUS, 'PENDENTE') as status_aprovacao " +
            "FROM ORCAMENTOS o " +
            "INNER JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "INNER JOIN EMPRESAS e ON o.ENTIDADE = e.ENTIDADE " +
            "INNER JOIN USUARIOS u ON o.usuario_criador_id = u.id " +
            "LEFT JOIN SOLICITACOES_APROVACAO sa ON o.orcamentoid = sa.orcamentoid " +
            "WHERE (CAST(:dataInicio AS DATE) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS DATE)) " +
            "AND (CAST(:dataFim AS DATE) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS DATE)) " +
            "AND (:usuarioCriadorId IS NULL OR u.id = :usuarioCriadorId) " +
            "AND (:prestadorId IS NULL OR p.COD_PRESTADOR = :prestadorId) " +
            "AND (:empresaId IS NULL OR e.ENTIDADE = :empresaId) " +
            "AND (:descricao IS NULL OR UPPER(o.DESCRICAO) LIKE UPPER(CONCAT('%', :descricao, '%'))) " +
            "AND (:tipoPagamento IS NULL OR o.TIPO_PAGAMENTO = :tipoPagamento) " +
            "AND (:valorMin IS NULL OR o.VALOR_FINAL >= :valorMin) " +
            "AND (:valorMax IS NULL OR o.VALOR_FINAL <= :valorMax) " +
            "AND (:statusAprovacao IS NULL OR COALESCE(sa.STATUS, 'PENDENTE') = :statusAprovacao)",
            countQuery = "SELECT COUNT(*) " +
            "FROM ORCAMENTOS o " +
            "INNER JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "INNER JOIN EMPRESAS e ON o.ENTIDADE = e.ENTIDADE " +
            "INNER JOIN USUARIOS u ON o.usuario_criador_id = u.id " +
            "LEFT JOIN SOLICITACOES_APROVACAO sa ON o.orcamentoid = sa.orcamentoid " +
            "WHERE (CAST(:dataInicio AS DATE) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS DATE)) " +
            "AND (CAST(:dataFim AS DATE) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS DATE)) " +
            "AND (:usuarioCriadorId IS NULL OR u.id = :usuarioCriadorId) " +
            "AND (:prestadorId IS NULL OR p.COD_PRESTADOR = :prestadorId) " +
            "AND (:empresaId IS NULL OR e.ENTIDADE = :empresaId) " +
            "AND (:descricao IS NULL OR UPPER(o.DESCRICAO) LIKE UPPER(CONCAT('%', :descricao, '%'))) " +
            "AND (:tipoPagamento IS NULL OR o.TIPO_PAGAMENTO = :tipoPagamento) " +
            "AND (:valorMin IS NULL OR o.VALOR_FINAL >= :valorMin) " +
            "AND (:valorMax IS NULL OR o.VALOR_FINAL <= :valorMax) " +
            "AND (:statusAprovacao IS NULL OR COALESCE(sa.STATUS, 'PENDENTE') = :statusAprovacao)",
            nativeQuery = true)
    org.springframework.data.domain.Page<Object[]> buscarOrcamentosComFiltros(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("usuarioCriadorId") Long usuarioCriadorId,
            @Param("prestadorId") Long prestadorId,
            @Param("empresaId") Long empresaId,
            @Param("descricao") String descricao,
            @Param("tipoPagamento") String tipoPagamento,
            @Param("valorMin") Float valorMin,
            @Param("valorMax") Float valorMax,
            @Param("statusAprovacao") String statusAprovacao,
            org.springframework.data.domain.Pageable pageable);

    /**
     * Busca todos os orçamentos para exportação CSV (sem paginação)
     */
    @Query(value = "SELECT o.orcamentoid, " +
            "TO_CHAR(o.MOVIMENTO, 'DD/MM/YYYY') as movimento, " +
            "u.username as usuario_criador, " +
            "p.NOME as prestador, " +
            "e.NOME as empresa, " +
            "o.DESCRICAO, " +
            "o.TIPO_PAGAMENTO, " +
            "o.VALOR_FINAL, " +
            "COALESCE(sa.STATUS, 'PENDENTE') as status_aprovacao " +
            "FROM ORCAMENTOS o " +
            "INNER JOIN PRESTADORES p ON o.COD_PRESTADOR = p.COD_PRESTADOR " +
            "INNER JOIN EMPRESAS e ON o.ENTIDADE = e.ENTIDADE " +
            "INNER JOIN USUARIOS u ON o.usuario_criador_id = u.id " +
            "LEFT JOIN SOLICITACOES_APROVACAO sa ON o.orcamentoid = sa.orcamentoid " +
            "WHERE (CAST(:dataInicio AS DATE) IS NULL OR o.MOVIMENTO >= CAST(:dataInicio AS DATE)) " +
            "AND (CAST(:dataFim AS DATE) IS NULL OR o.MOVIMENTO <= CAST(:dataFim AS DATE)) " +
            "AND (:usuarioCriadorId IS NULL OR u.id = :usuarioCriadorId) " +
            "AND (:prestadorId IS NULL OR p.COD_PRESTADOR = :prestadorId) " +
            "AND (:empresaId IS NULL OR e.ENTIDADE = :empresaId) " +
            "AND (:descricao IS NULL OR UPPER(o.DESCRICAO) LIKE UPPER(CONCAT('%', :descricao, '%'))) " +
            "AND (:tipoPagamento IS NULL OR o.TIPO_PAGAMENTO = :tipoPagamento) " +
            "AND (:valorMin IS NULL OR o.VALOR_FINAL >= :valorMin) " +
            "AND (:valorMax IS NULL OR o.VALOR_FINAL <= :valorMax) " +
            "AND (:statusAprovacao IS NULL OR COALESCE(sa.STATUS, 'PENDENTE') = :statusAprovacao)",
            nativeQuery = true)
    List<Object[]> buscarOrcamentosParaExportacao(
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim,
            @Param("usuarioCriadorId") Long usuarioCriadorId,
            @Param("prestadorId") Long prestadorId,
            @Param("empresaId") Long empresaId,
            @Param("descricao") String descricao,
            @Param("tipoPagamento") String tipoPagamento,
            @Param("valorMin") Float valorMin,
            @Param("valorMax") Float valorMax,
            @Param("statusAprovacao") String statusAprovacao);
}
