package org.example.pagamentos.service;

import org.example.pagamentos.DTO.EmpresaDTO;
import org.example.pagamentos.exception.AccessDeniedException;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.model.Usuario;
import org.example.pagamentos.repository.EmpresaRespository;
import org.example.pagamentos.security.AuthenticationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRespository empresaRespository;
    private final AuthenticationUtil authenticationUtil;

    public EmpresaService(EmpresaRespository empresaRespository, AuthenticationUtil authenticationUtil) {
        this.empresaRespository = empresaRespository;
        this.authenticationUtil = authenticationUtil;
    }

    public EmpresaDTO buscarPorId(Long id){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();

        EmpresaModel empresaModel = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a empresa
        if (!authenticationUtil.isAdmin() && !empresaModel.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para acessar esta empresa");
        }

        return toDTO(empresaModel);
    }

    public List<EmpresaDTO> buscarTodos(){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        List<EmpresaDTO> listaDTO;
        
        // ADMIN vê todas, SOLICITANTE vê apenas suas
        if (authenticationUtil.isAdmin()) {
            listaDTO = empresaRespository
                    .findAll()
                    .stream()
                    .map(this::toDTO)
                    .toList();
        } else {
            listaDTO = empresaRespository
                    .findByUsuarioCriador(usuarioAutenticado)
                    .stream()
                    .map(this::toDTO)
                    .toList();
        }

        return listaDTO;
    }

    public EmpresaDTO cadastrarEmpresa (EmpresaDTO empresaDTO){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        EmpresaModel empresa = new EmpresaModel();

        empresa.setNome(empresaDTO.getNome());
        empresa.setCnpj(empresaDTO.getCnpj());
        empresa.setRazao(empresaDTO.getRazao());
        empresa.setUsuarioCriador(usuarioAutenticado);

        return toDTO(empresaRespository.save(empresa));
    }

    public EmpresaDTO atualizarEmpresa (Long id,EmpresaDTO dados){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        EmpresaModel empresa = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a empresa
        if (!authenticationUtil.isAdmin() && !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para alterar esta empresa");
        }

        empresa.setNome(dados.getNome());
        empresa.setCnpj(dados.getCnpj());
        empresa.setRazao(dados.getRazao());

        return toDTO(empresaRespository.save(empresa));
    }

    public void deletarEmpresa (Long id){
        Usuario usuarioAutenticado = authenticationUtil.getUsuarioAutenticado();
        
        EmpresaModel empresa = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        // Verifica se o usuário é ADMIN ou se criou a empresa
        if (!authenticationUtil.isAdmin() && !empresa.getUsuarioCriador().getId().equals(usuarioAutenticado.getId())) {
            throw new AccessDeniedException("Você não tem permissão para deletar esta empresa");
        }

        empresaRespository.delete(empresa);
    }

    private EmpresaDTO toDTO(EmpresaModel empresaModel){

        EmpresaDTO empresaDTO = new EmpresaDTO();
        empresaDTO.setIdEmpresa(empresaModel.getIdEmpresa());
        empresaDTO.setNome(empresaModel.getNome());
        empresaDTO.setCnpj(empresaModel.getCnpj());
        empresaDTO.setRazao(empresaModel.getRazao());

        return empresaDTO;
    }
}
