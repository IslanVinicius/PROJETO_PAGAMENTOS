package org.example.pagamentos.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${app.upload.dir:${user.home}/uploads/orcamentos}")
    private String uploadDir;

    public String salvarArquivo(MultipartFile arquivo, Long orcamentoId) throws IOException {
        // Criar diretório se não existir
        Path diretorioOrcamento = Paths.get(uploadDir, String.valueOf(orcamentoId));
        Files.createDirectories(diretorioOrcamento);

        // Gerar nome único para o arquivo
        String nomeOriginal = arquivo.getOriginalFilename();
        String extensao = nomeOriginal != null && nomeOriginal.contains(".") 
            ? nomeOriginal.substring(nomeOriginal.lastIndexOf(".")) 
            : "";
        String nomeArquivo = UUID.randomUUID().toString() + extensao;

        // Salvar arquivo
        Path caminhoArquivo = diretorioOrcamento.resolve(nomeArquivo);
        Files.copy(arquivo.getInputStream(), caminhoArquivo, StandardCopyOption.REPLACE_EXISTING);

        return caminhoArquivo.toString();
    }

    public void deletarArquivo(String caminhoArquivo) {
        try {
            Path path = Paths.get(caminhoArquivo);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log do erro, mas não lança exceção
            System.err.println("Erro ao deletar arquivo: " + e.getMessage());
        }
    }

    public void deletarDiretorioOrcamento(Long orcamentoId) {
        try {
            Path diretorio = Paths.get(uploadDir, String.valueOf(orcamentoId));
            if (Files.exists(diretorio)) {
                Files.walk(diretorio)
                    .sorted((a, b) -> -a.compareTo(b))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            System.err.println("Erro ao deletar: " + e.getMessage());
                        }
                    });
            }
        } catch (IOException e) {
            System.err.println("Erro ao deletar diretório: " + e.getMessage());
        }
    }

    public byte[] carregarArquivo(String caminhoArquivo) throws IOException {
        Path path = Paths.get(caminhoArquivo);
        return Files.readAllBytes(path);
    }

    public boolean isImagem(String tipoArquivo) {
        return tipoArquivo != null && (
            tipoArquivo.equals("image/jpeg") ||
            tipoArquivo.equals("image/png") ||
            tipoArquivo.equals("image/gif") ||
            tipoArquivo.equals("image/webp")
        );
    }
}
