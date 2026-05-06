package org.example.pagamentos.service;

import lombok.RequiredArgsConstructor;
import org.example.pagamentos.DTO.EmpresaSimplesDTO;
import org.example.pagamentos.DTO.PrestadorSimplesDTO;
import org.example.pagamentos.DTO.UsuarioSimplesDTO;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.repository.PrestadorRepository;
import org.example.pagamentos.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service para operações de filtro do dashboard
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioDashboardService {

    private final UsuarioRepository usuarioRepository;
    private final PrestadorRepository prestadorRepository;
    private final EmpresaRespository empresaRepository;

    /**
     * Lista todos os usuários ativos para filtros
     */
    public List<UsuarioSimplesDTO> listarUsuariosAtivos() {
        return usuarioRepository.findAll().stream()
                .map(usuario -> new UsuarioSimplesDTO(
                        usuario.getId(),
                        usuario.getUsername()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lista todos os prestadores ativos para filtros
     */
    public List<PrestadorSimplesDTO> listarPrestadoresAtivos() {
        return prestadorRepository.findAll().stream()
                .map(prestador -> new PrestadorSimplesDTO(
                        prestador.getCodPrestador(),
                        prestador.getNome()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Lista todas as empresas ativas para filtros
     */
    public List<EmpresaSimplesDTO> listarEmpresasAtivas() {
        return empresaRepository.findAll().stream()
                .map(empresa -> new EmpresaSimplesDTO(
                        empresa.getIdEmpresa(),
                        empresa.getNome()
                ))
                .collect(Collectors.toList());
    }
}
