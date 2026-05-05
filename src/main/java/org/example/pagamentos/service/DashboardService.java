package org.example.pagamentos.service;

import org.example.pagamentos.DTO.DashboardDTO;
import org.example.pagamentos.DTO.DashboardFiltroDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrcamentoRepository orcamentoRepository;
    private final AuthenticationUtil authenticationUtil;

    public DashboardService(OrcamentoRepository orcamentoRepository,
                           AuthenticationUtil authenticationUtil) {
        this.orcamentoRepository = orcamentoRepository;
        this.authenticationUtil = authenticationUtil;
    }

    /**
     * Obtém dados consolidados do dashboard com suporte a filtros opcionais
     */
    public DashboardDTO getDashboard(DashboardFiltroDTO filtro) {
        // Verificar permissão - apenas ADMIN pode acessar
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar o dashboard");
        }

        // Converter strings de data para LocalDate
        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());

        // Buscar KPIs
        Object[] kpisArray = orcamentoRepository.buscarKpis(dataInicio, dataFim);

        Integer totalOrcamentos = 0;
        Float valorTotal = 0f;
        Float ticketMedio = 0f;

        if (kpisArray != null && kpisArray.length >= 3) {
            totalOrcamentos = kpisArray[0] != null ? ((Number) kpisArray[0]).intValue() : 0;
            valorTotal = kpisArray[1] != null ? ((Number) kpisArray[1]).floatValue() : 0f;
            ticketMedio = kpisArray[2] != null ? ((Number) kpisArray[2]).floatValue() : 0f;
        }

        // Buscar dados por empresa
        List<Object[]> empresasArray = orcamentoRepository.buscarOrcamentosPorEmpresa(
                dataInicio, dataFim);
        List<Map<String, Object>> orcamentosPorEmpresa = empresasArray.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", row[0]);
                    map.put("nome", row[1]);
                    map.put("total", row[2] != null ? ((Number) row[2]).longValue() : 0L);
                    map.put("valor", row[3] != null ? ((Number) row[3]).doubleValue() : 0.0);
                    return map;
                })
                .collect(Collectors.toList());

        // Buscar dados por prestador
        List<Object[]> prestadoresArray = orcamentoRepository.buscarOrcamentosPorPrestador(
                dataInicio, dataFim);
        List<Map<String, Object>> orcamentosPorPrestador = prestadoresArray.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", row[0]);
                    map.put("nome", row[1]);
                    map.put("total", row[2] != null ? ((Number) row[2]).longValue() : 0L);
                    map.put("valor", row[3] != null ? ((Number) row[3]).doubleValue() : 0.0);
                    return map;
                })
                .collect(Collectors.toList());

        // Buscar dados por período
        List<Object[]> periodosArray = orcamentoRepository.buscarOrcamentosPorPeriodo(
                dataInicio, dataFim);
        List<Map<String, Object>> orcamentosPorPeriodo = periodosArray.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    Integer ano = row[0] != null ? ((Number) row[0]).intValue() : 0;
                    Integer mes = row[1] != null ? ((Number) row[1]).intValue() : 0;
                    String periodo = String.format("%d-%02d", ano, mes);

                    map.put("periodo", periodo);
                    map.put("ano", ano);
                    map.put("mes", mes);
                    map.put("total", row[2] != null ? ((Number) row[2]).longValue() : 0L);
                    map.put("valor", row[3] != null ? ((Number) row[3]).doubleValue() : 0.0);
                    return map;
                })
                .collect(Collectors.toList());

        // Buscar opções de filtro drill-down
        List<Object[]> empresasDisponiveisArray = orcamentoRepository.buscarEmpresasDisponiveis(
                dataInicio, dataFim);
        List<Map<String, Object>> empresasDisponiveis = empresasDisponiveisArray.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", row[0]);
                    map.put("nome", row[1]);
                    return map;
                })
                .collect(Collectors.toList());

        List<Object[]> prestadoresDisponiveisArray = orcamentoRepository.buscarPrestadoresDisponiveis(
                dataInicio, dataFim);
        List<Map<String, Object>> prestadoresDisponiveis = prestadoresDisponiveisArray.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", row[0]);
                    map.put("nome", row[1]);
                    return map;
                })
                .collect(Collectors.toList());

        List<String> tiposPagamentoDisponiveis = orcamentoRepository.buscarTiposPagamentoDisponiveis()
                .stream()
                .filter(Objects::nonNull)
                .map(Object::toString)
                .collect(Collectors.toList());

        // Montar DTO de resposta
        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setTotalOrcamentos(totalOrcamentos);
        dashboard.setValorTotal(valorTotal);
        dashboard.setTicketMedio(ticketMedio);
        dashboard.setOrcamentosPorEmpresa(orcamentosPorEmpresa);
        dashboard.setOrcamentosPorPrestador(orcamentosPorPrestador);
        dashboard.setOrcamentosPorPeriodo(orcamentosPorPeriodo);
        dashboard.setEmpresasDisponiveis(empresasDisponiveis);
        dashboard.setPrestadoresDisponiveis(prestadoresDisponiveis);
        dashboard.setTiposPagamentoDisponiveis(tiposPagamentoDisponiveis);

        return dashboard;
    }

    /**
     * Converte string de data (formato dd/MM/yyyy ou ISO) para LocalDate, ou retorna null
     */
    private LocalDate parseData(String data) {
        if (data == null || data.trim().isEmpty()) {
            return null;
        }

        try {
            // Tentar formato ISO (yyyy-MM-dd)
            return LocalDate.parse(data);
        } catch (Exception e1) {
            try {
                // Tentar formato brasileiro (dd/MM/yyyy)
                return LocalDate.parse(data, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            } catch (Exception e2) {
                System.err.println("Erro ao fazer parse da data: " + data);
                return null;
            }
        }
    }
}
