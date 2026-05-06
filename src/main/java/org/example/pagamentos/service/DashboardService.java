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
        
        // Se datas forem null, usar datas extremas para evitar erro no PostgreSQL
        // "could not determine data type of parameter"
        if (dataInicio == null) {
            dataInicio = LocalDate.of(1900, 1, 1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.of(9999, 12, 31);
        }

        // Buscar KPIs
        Object[] kpisArray = orcamentoRepository.buscarKpis(dataInicio, dataFim);

        Integer totalOrcamentos = 0;
        Float valorTotal = 0f;
        Float ticketMedio = 0f;

        if (kpisArray != null && kpisArray.length > 0) {
            // Verificar se o primeiro elemento é um array (caso especial)
            if (kpisArray[0] instanceof Object[]) {
                Object[] innerArray = (Object[]) kpisArray[0];
                totalOrcamentos = innerArray[0] != null ? ((Number) innerArray[0]).intValue() : 0;
                valorTotal = innerArray[1] != null ? ((Number) innerArray[1]).floatValue() : 0f;
                ticketMedio = innerArray[2] != null ? ((Number) innerArray[2]).floatValue() : 0f;
            } else if (kpisArray.length >= 3) {
                // Formato normal: [COUNT, SUM, AVG]
                totalOrcamentos = kpisArray[0] != null ? ((Number) kpisArray[0]).intValue() : 0;
                valorTotal = kpisArray[1] != null ? ((Number) kpisArray[1]).floatValue() : 0f;
                ticketMedio = kpisArray[2] != null ? ((Number) kpisArray[2]).floatValue() : 0f;
            }
        }

        // Calcular taxa de aprovação
        List<Object[]> statusData = orcamentoRepository.buscarDistribuicaoStatus(dataInicio, dataFim);
        float taxaAprovacao = calcularTaxaAprovacao(statusData);

        // Montar DTO de resposta
        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setTotalOrcamentos(totalOrcamentos);
        dashboard.setValorTotal(valorTotal);
        dashboard.setTicketMedio(ticketMedio);
        dashboard.setTaxaAprovacao(taxaAprovacao);
        
        return dashboard;
    }

    /**
     * Retorna evolução de orçamentos por período
     */
    public List<Map<String, Object>> getEvolucao(DashboardFiltroDTO filtro) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar o dashboard");
        }

        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());
        
        if (dataInicio == null) {
            dataInicio = LocalDate.of(1900, 1, 1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.of(9999, 12, 31);
        }

        List<Object[]> results = orcamentoRepository.buscarEvolucaoPorPeriodo(dataInicio, dataFim);
        
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("data", row[0].toString());
            map.put("valor", ((Number) row[1]).floatValue());
            map.put("quantidade", ((Number) row[2]).intValue());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Retorna ranking de prestadores
     */
    public List<Map<String, Object>> getPrestadores(DashboardFiltroDTO filtro) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar o dashboard");
        }

        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());
        
        if (dataInicio == null) {
            dataInicio = LocalDate.of(1900, 1, 1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.of(9999, 12, 31);
        }

        List<Object[]> results = orcamentoRepository.buscarRankingPrestadores(dataInicio, dataFim);
        
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("prestadorId", ((Number) row[0]).longValue());
            map.put("nome", row[1].toString());
            map.put("valorTotal", ((Number) row[2]).floatValue());
            map.put("quantidade", ((Number) row[3]).intValue());
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Retorna distribuição por status
     */
    public List<Map<String, Object>> getStatus(DashboardFiltroDTO filtro) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar o dashboard");
        }

        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());
        
        if (dataInicio == null) {
            dataInicio = LocalDate.of(1900, 1, 1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.of(9999, 12, 31);
        }

        List<Object[]> results = orcamentoRepository.buscarDistribuicaoStatus(dataInicio, dataFim);
        
        int total = results.stream().mapToInt(row -> ((Number) row[1]).intValue()).sum();
        
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            String status = row[0].toString();
            int quantidade = ((Number) row[1]).intValue();
            float percentual = total > 0 ? (quantidade * 100.0f / total) : 0;
            
            map.put("status", status);
            map.put("quantidade", quantidade);
            map.put("percentual", percentual);
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Retorna últimos orçamentos
     */
    public List<Map<String, Object>> getUltimosOrcamentos(DashboardFiltroDTO filtro, int limite) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar o dashboard");
        }

        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());
        
        if (dataInicio == null) {
            dataInicio = LocalDate.of(1900, 1, 1);
        }
        if (dataFim == null) {
            dataFim = LocalDate.of(9999, 12, 31);
        }

        List<Object[]> results = orcamentoRepository.buscarUltimosOrcamentos(dataInicio, dataFim, limite);
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        
        return results.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("orcamentoId", ((Number) row[0]).longValue());
            map.put("prestador", row[1].toString());
            map.put("valor", ((Number) row[2]).floatValue());
            map.put("status", row[3].toString());
            
            // Formatar data
            try {
                LocalDate data = LocalDate.parse(row[4].toString());
                map.put("data", data.format(formatter));
            } catch (Exception e) {
                map.put("data", row[4].toString());
            }
            
            return map;
        }).collect(Collectors.toList());
    }

    /**
     * Calcula taxa de aprovação baseada nos dados de status
     */
    private float calcularTaxaAprovacao(List<Object[]> statusData) {
        if (statusData == null || statusData.isEmpty()) {
            return 0;
        }
        
        int total = 0;
        int aprovados = 0;
        
        for (Object[] row : statusData) {
            String status = row[0].toString();
            int quantidade = ((Number) row[1]).intValue();
            total += quantidade;
            
            if ("APROVADO".equalsIgnoreCase(status)) {
                aprovados += quantidade;
            }
        }
        
        return total > 0 ? (aprovados * 100.0f / total) : 0;
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
