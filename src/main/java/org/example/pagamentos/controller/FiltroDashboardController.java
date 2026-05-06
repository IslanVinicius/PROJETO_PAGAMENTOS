package org.example.pagamentos.controller;

import lombok.RequiredArgsConstructor;
import org.example.pagamentos.DTO.EmpresaSimplesDTO;
import org.example.pagamentos.DTO.PrestadorSimplesDTO;
import org.example.pagamentos.DTO.UsuarioSimplesDTO;
import org.example.pagamentos.Enums.TipoPagamento;
import org.example.pagamentos.service.UsuarioDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller para fornecer dados de filtro do dashboard
 */
@RestController
@RequestMapping("/api/dashboard/filtros")
@RequiredArgsConstructor
public class FiltroDashboardController {

    private final UsuarioDashboardService usuarioDashboardService;

    /**
     * Lista todos os usuários ativos para filtros
     */
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioSimplesDTO>> listarUsuarios() {
        List<UsuarioSimplesDTO> usuarios = usuarioDashboardService.listarUsuariosAtivos();
        return ResponseEntity.ok(usuarios);
    }

    /**
     * Lista todos os prestadores ativos para filtros
     */
    @GetMapping("/prestadores")
    public ResponseEntity<List<PrestadorSimplesDTO>> listarPrestadores() {
        List<PrestadorSimplesDTO> prestadores = usuarioDashboardService.listarPrestadoresAtivos();
        return ResponseEntity.ok(prestadores);
    }

    /**
     * Lista todas as empresas ativas para filtros
     */
    @GetMapping("/empresas")
    public ResponseEntity<List<EmpresaSimplesDTO>> listarEmpresas() {
        List<EmpresaSimplesDTO> empresas = usuarioDashboardService.listarEmpresasAtivas();
        return ResponseEntity.ok(empresas);
    }

    /**
     * Lista todos os tipos de pagamento disponíveis (do Enum)
     */
    @GetMapping("/tipos-pagamento")
    public ResponseEntity<List<String>> listarTiposPagamento() {
        List<String> tipos = Arrays.stream(TipoPagamento.values())
                .map(tipo -> tipo.name()) // Retorna o nome do enum (ex: A_VISTA)
                .collect(Collectors.toList());
        return ResponseEntity.ok(tipos);
    }
}
