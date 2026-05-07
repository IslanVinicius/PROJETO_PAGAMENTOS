package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.OrcamentoDashboardDTO;
import org.example.pagamentos.DTO.OrcamentoFiltroDTO;
import org.example.pagamentos.DTO.OrcamentoPageResponseDTO;
import org.example.pagamentos.service.OrcamentoDashboardService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class OrcamentoDashboardController {

    private final OrcamentoDashboardService orcamentoDashboardService;

    public OrcamentoDashboardController(OrcamentoDashboardService orcamentoDashboardService) {
        this.orcamentoDashboardService = orcamentoDashboardService;
    }

    /**
     * Busca orçamentos com filtros avançados e paginação
     */
    @PostMapping("/orcamentos")
    public ResponseEntity<OrcamentoPageResponseDTO> buscarOrcamentos(
            @RequestBody(required = false) OrcamentoFiltroDTO filtro) {
        
        if (filtro == null) {
            filtro = new OrcamentoFiltroDTO();
        }

        OrcamentoPageResponseDTO response = orcamentoDashboardService.buscarOrcamentos(filtro);
        return ResponseEntity.ok(response);
    }

    /**
     * Exporta orçamentos para CSV
     */
    @PostMapping("/orcamentos/export")
    public ResponseEntity<byte[]> exportarCSV(@RequestBody(required = false) OrcamentoFiltroDTO filtro) {
        if (filtro == null) {
            filtro = new OrcamentoFiltroDTO();
        }

        List<OrcamentoDashboardDTO> orcamentos = orcamentoDashboardService.exportarOrcamentos(filtro);

        // Gerar CSV com BOM para UTF-8 (compatibilidade com Excel)
        String csv = gerarCSV(orcamentos);
        
        // Adicionar BOM (Byte Order Mark) para UTF-8
        byte[] bom = {(byte) 0xEF, (byte) 0xBB, (byte) 0xBF};
        byte[] csvBytes = csv.getBytes(StandardCharsets.UTF_8);
        byte[] csvWithBom = new byte[bom.length + csvBytes.length];
        
        System.arraycopy(bom, 0, csvWithBom, 0, bom.length);
        System.arraycopy(csvBytes, 0, csvWithBom, bom.length, csvBytes.length);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orcamentos_export.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvWithBom);
    }

    /**
     * Gera conteúdo CSV a partir da lista de orçamentos
     */
    private String gerarCSV(List<OrcamentoDashboardDTO> orcamentos) {
        StringBuilder sb = new StringBuilder();

        // Header
        sb.append("Movimento;Usuário Criador;Prestador;Empresa;Descrição;Tipo Pagamento;Status Aprovação;Valor Final\n");

        // Dados
        for (OrcamentoDashboardDTO orc : orcamentos) {
            sb.append(orc.getMovimento()).append(";");
            sb.append(escaparCSV(orc.getUsuarioCriador())).append(";");
            sb.append(escaparCSV(orc.getPrestador())).append(";");
            sb.append(escaparCSV(orc.getEmpresa())).append(";");
            sb.append(escaparCSV(orc.getDescricao())).append(";");
            sb.append(orc.getTipoPagamento()).append(";");
            sb.append(orc.getStatusAprovacao() != null ? orc.getStatusAprovacao() : "PENDENTE").append(";");
            sb.append(String.format("%.2f", orc.getValorFinal() != null ? orc.getValorFinal() : 0)).append("\n");
        }

        return sb.toString();
    }

    /**
     * Escapa campos CSV que podem conter ponto-e-vírgula ou aspas
     */
    private String escaparCSV(String campo) {
        if (campo == null) {
            return "";
        }
        
        if (campo.contains(";") || campo.contains("\"") || campo.contains("\n")) {
            return "\"" + campo.replace("\"", "\"\"") + "\"";
        }
        
        return campo;
    }
}
