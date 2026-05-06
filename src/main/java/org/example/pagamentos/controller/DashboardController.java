package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.DashboardDTO;
import org.example.pagamentos.DTO.DashboardFiltroDTO;
import org.example.pagamentos.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Endpoint principal - retorna KPIs consolidados
     */
    @PostMapping("/resumo")
    public ResponseEntity<org.example.pagamentos.DTO.DashboardDTO> getResumo(@RequestBody(required = false) DashboardFiltroDTO filtro) {
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        org.example.pagamentos.DTO.DashboardDTO dashboard = dashboardService.getDashboard(filtro);
        return ResponseEntity.ok(dashboard);
    }

    /**
     * Retorna evolução de orçamentos por período
     */
    @PostMapping("/evolucao")
    public ResponseEntity<List<Map<String, Object>>> getEvolucao(@RequestBody(required = false) DashboardFiltroDTO filtro) {
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        List<Map<String, Object>> evolucao = dashboardService.getEvolucao(filtro);
        return ResponseEntity.ok(evolucao);
    }

    /**
     * Retorna ranking de prestadores
     */
    @PostMapping("/prestadores")
    public ResponseEntity<List<Map<String, Object>>> getPrestadores(@RequestBody(required = false) DashboardFiltroDTO filtro) {
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        List<Map<String, Object>> prestadores = dashboardService.getPrestadores(filtro);
        return ResponseEntity.ok(prestadores);
    }

    /**
     * Retorna distribuição por status
     */
    @PostMapping("/status")
    public ResponseEntity<List<Map<String, Object>>> getStatus(@RequestBody(required = false) DashboardFiltroDTO filtro) {
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        List<Map<String, Object>> status = dashboardService.getStatus(filtro);
        return ResponseEntity.ok(status);
    }

    /**
     * Retorna últimos orçamentos
     */
    @PostMapping("/ultimos")
    public ResponseEntity<List<Map<String, Object>>> getUltimos(
            @RequestBody(required = false) DashboardFiltroDTO filtro,
            @RequestParam(defaultValue = "10") int limite) {
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        List<Map<String, Object>> ultimos = dashboardService.getUltimosOrcamentos(filtro, limite);
        return ResponseEntity.ok(ultimos);
    }
}
