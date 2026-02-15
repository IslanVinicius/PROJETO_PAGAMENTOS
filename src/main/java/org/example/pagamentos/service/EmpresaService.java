package org.example.pagamentos.service;

import org.example.pagamentos.DTO.EmpresaDTO;
import org.example.pagamentos.model.EmpresaModel;
import org.example.pagamentos.repository.EmpresaRespository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmpresaService {

    private final EmpresaRespository  empresaRespository;

    public EmpresaService(EmpresaRespository empresaRespository) {
        this.empresaRespository = empresaRespository;
    }

    public EmpresaDTO buscarPorId(Long id){

        EmpresaModel empresaModel = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        return toDTO(empresaModel);
    }

    public List<EmpresaDTO> buscarTodos(){

        List<EmpresaDTO> listaDTO = empresaRespository
                .findAll()
                .stream()
                .map(this::toDTO)
                .toList();

        return listaDTO;
    }

    public EmpresaDTO cadastrarEmpresa (EmpresaDTO empresaDTO){
        EmpresaModel empresa = new EmpresaModel();

        empresa.setNome(empresaDTO.getNome());
        empresa.setCnpj(empresaDTO.getCnpj());
        empresa.setRazao(empresaDTO.getRazao());

        return toDTO(empresaRespository.save(empresa));
    }

    public EmpresaDTO atualizarEmpresa (Long id,EmpresaDTO dados){
        EmpresaModel empresa = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

        empresa.setNome(dados.getNome());
        empresa.setCnpj(dados.getCnpj());
        empresa.setRazao(dados.getRazao());

        return toDTO(empresaRespository.save(empresa));
    }

    public void deletarEmpresa (Long id){
        EmpresaModel empresa = empresaRespository
                .findById(id)
                .orElseThrow(()-> new RuntimeException("Empresa não encontrada"));

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
