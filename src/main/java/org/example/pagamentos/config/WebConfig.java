package org.example.pagamentos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar para servir arquivos estáticos do React (quando buildado)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // Ignorar favicon.ico e outros recursos específicos
                        if (resourcePath.equals("favicon.ico") || 
                            resourcePath.startsWith("webjars/")) {
                            return null;
                        }
                        
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // Se o recurso existe e é legível, retorna ele
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // Para todas as outras rotas, retorna o index.html (SPA fallback)
                        // Isso permite que o React Router funcione corretamente
                        Resource indexHtml = new ClassPathResource("/static/index.html");
                        if (indexHtml.exists() && indexHtml.isReadable()) {
                            return indexHtml;
                        }
                        
                        // Se não houver index.html, retorna null (deixa o Spring lidar com 404)
                        return null;
                    }
                });
    }
}
