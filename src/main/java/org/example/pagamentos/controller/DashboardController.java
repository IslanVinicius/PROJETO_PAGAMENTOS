package org.example.pagamentos.controller;

import org.example.pagamentos.DTO.DashboardDTO;
import org.example.pagamentos.DTO.DashboardFiltroDTO;
import org.example.pagamentos.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping
    public ResponseEntity<DashboardDTO> getDashboard(@RequestBody(required = false) DashboardFiltroDTO filtro) {
        // Tratar caso onde o body é nulo ou vazio
        if (filtro == null) {
            filtro = new DashboardFiltroDTO();
        }

        DashboardDTO dashboard = dashboardService.getDashboard(filtro);
        return ResponseEntity.ok(dashboard);
    }
}
