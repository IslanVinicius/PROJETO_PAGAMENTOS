package org.example.pagamentos.service;

import org.example.pagamentos.DTO.OrcamentoDashboardDTO;
import org.example.pagamentos.DTO.OrcamentoFiltroDTO;
import org.example.pagamentos.DTO.OrcamentoPageResponseDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.repository.OrcamentoRepository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrcamentoDashboardService {

    private final OrcamentoRepository orcamentoRepository;
    private final AuthenticationUtil authenticationUtil;

    public OrcamentoDashboardService(OrcamentoRepository orcamentoRepository,
                                     AuthenticationUtil authenticationUtil) {
        this.orcamentoRepository = orcamentoRepository;
        this.authenticationUtil = authenticationUtil;
    }

    /**
     * Busca orçamentos com filtros avançados e paginação
     */
    public OrcamentoPageResponseDTO buscarOrcamentos(OrcamentoFiltroDTO filtro) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar esta funcionalidade");
        }

        // Converter datas
        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());

        // Criar ordenação segura via Pageable
        String sortBy = validarColunaOrdenacao(filtro.getSortBy());
        org.springframework.data.domain.Sort.Direction direction = 
            "asc".equalsIgnoreCase(filtro.getSortDirection()) ? 
                org.springframework.data.domain.Sort.Direction.ASC : 
                org.springframework.data.domain.Sort.Direction.DESC;

        // Criar Pageable com ordenação
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(filtro.getPage(), filtro.getSize(), direction, sortBy);

        // Buscar dados paginados
        org.springframework.data.domain.Page<Object[]> page = orcamentoRepository.buscarOrcamentosComFiltros(
                dataInicio, dataFim,
                filtro.getUsuarioCriadorId(),
                filtro.getPrestadorId(),
                filtro.getEmpresaId(),
                filtro.getDescricao(),
                filtro.getTipoPagamento(),
                filtro.getValorMin(),
                filtro.getValorMax(),
                filtro.getStatusAprovacao(),
                pageable
        );

        // Converter para DTO
        List<OrcamentoDashboardDTO> content = page.getContent().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());

        // Montar resposta
        OrcamentoPageResponseDTO response = new OrcamentoPageResponseDTO();
        response.setContent(content);
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());

        return response;
    }

    /**
     * Exporta orçamentos para CSV (todos os registros filtrados)
     */
    public List<OrcamentoDashboardDTO> exportarOrcamentos(OrcamentoFiltroDTO filtro) {
        if (!authenticationUtil.hasFullDataAccess()) {
            throw new AccessDeniedException("Apenas administradores podem acessar esta funcionalidade");
        }

        LocalDate dataInicio = parseData(filtro.getDataInicio());
        LocalDate dataFim = parseData(filtro.getDataFim());

        // Criar ordenação segura
        String sortBy = validarColunaOrdenacao(filtro.getSortBy());
        org.springframework.data.domain.Sort.Direction direction = 
            "asc".equalsIgnoreCase(filtro.getSortDirection()) ? 
                org.springframework.data.domain.Sort.Direction.ASC : 
                org.springframework.data.domain.Sort.Direction.DESC;
        
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortBy);

        // Buscar dados sem paginação mas com ordenação
        // Nota: Para grandes volumes, considere usar streaming ou paginação
        List<Object[]> results = orcamentoRepository.buscarOrcamentosParaExportacao(
                dataInicio, dataFim,
                filtro.getUsuarioCriadorId(),
                filtro.getPrestadorId(),
                filtro.getEmpresaId(),
                filtro.getDescricao(),
                filtro.getTipoPagamento(),
                filtro.getValorMin(),
                filtro.getValorMax(),
                filtro.getStatusAprovacao()
        );

        // Aplicar ordenação em memória (para exportação)
        // Em produção com muitos dados, considere usar paginação
        return results.stream()
                .map(this::converterParaDTO)
                .sorted((a, b) -> {
                    int result = 0;
                    switch (sortBy.toLowerCase()) {
                        case "movimento":
                            result = a.getMovimento().compareTo(b.getMovimento());
                            break;
                        case "usuariocriador":
                            result = a.getUsuarioCriador().compareTo(b.getUsuarioCriador());
                            break;
                        case "prestador":
                            result = a.getPrestador().compareTo(b.getPrestador());
                            break;
                        case "empresa":
                            result = a.getEmpresa().compareTo(b.getEmpresa());
                            break;
                        case "descricao":
                            result = a.getDescricao().compareTo(b.getDescricao());
                            break;
                        case "tipopagamento":
                            result = a.getTipoPagamento().compareTo(b.getTipoPagamento());
                            break;
                        case "valorfinal":
                            result = Float.compare(
                                a.getValorFinal() != null ? a.getValorFinal() : 0f,
                                b.getValorFinal() != null ? b.getValorFinal() : 0f
                            );
                            break;
                    }
                    return direction == org.springframework.data.domain.Sort.Direction.ASC ? result : -result;
                })
                .collect(Collectors.toList());
    }

    /**
     * Converte array de objetos do banco para DTO
     */
    private OrcamentoDashboardDTO converterParaDTO(Object[] row) {
        OrcamentoDashboardDTO dto = new OrcamentoDashboardDTO();
        dto.setOrcamentoId(((Number) row[0]).longValue());
        dto.setMovimento(row[1].toString());
        dto.setUsuarioCriador(row[2].toString());
        dto.setPrestador(row[3].toString());
        dto.setEmpresa(row[4].toString());
        dto.setDescricao(row[5] != null ? row[5].toString() : "");
        dto.setTipoPagamento(row[6] != null ? row[6].toString() : "");
        dto.setValorFinal(row[7] != null ? ((Number) row[7]).floatValue() : 0f);
        dto.setStatusAprovacao(row[8] != null ? row[8].toString() : "PENDENTE");
        return dto;
    }

    /**
     * Valida coluna de ordenação para prevenir SQL injection
     */
    private String validarColunaOrdenacao(String sortBy) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            return "MOVIMENTO";
        }

        // Mapear nomes amigáveis para colunas do banco (sem prefixo de tabela!)
        switch (sortBy.toLowerCase()) {
            case "movimento":
                return "MOVIMENTO";
            case "usuariocriador":
                return "usuario_criador";
            case "prestador":
                return "prestador";
            case "empresa":
                return "empresa";
            case "descricao":
                return "DESCRICAO";
            case "tipopagamento":
                return "TIPO_PAGAMENTO";
            case "valorfinal":
                return "VALOR_FINAL";
            case "statusaprovacao":
                return "status_aprovacao";
            default:
                return "MOVIMENTO"; // Default seguro
        }
    }

    /**
     * Converte string de data para LocalDate
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
