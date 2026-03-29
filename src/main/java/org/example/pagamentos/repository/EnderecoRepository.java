package org.example.pagamentos.repository;

import org.example.pagamentos.model.EnderecoModel;
import org.example.pagamentos.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnderecoRepository extends JpaRepository<EnderecoModel, Long> {
    
    /**
     * Busca todos os endereços de uma empresa específica
     */
    List<EnderecoModel> findByEmpresaIdEmpresa(Long idEmpresa);
    
    /**
     * Busca todos os endereços criados por um usuário específico
     */
    List<EnderecoModel> findByUsuarioCriador(Usuario usuarioCriador);
    
    /**
     * Busca um endereço específico, verificando se pertence ao usuário
     */
    EnderecoModel findByIdEnderecoAndUsuarioCriador(Long idEndereco, Usuario usuarioCriador);

    /**
     * Verifica se já existe um endereço para a empresa informada
     */
    boolean existsByEmpresaIdEmpresa(Long idEmpresa);
}
