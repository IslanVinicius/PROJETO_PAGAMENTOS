package org.example.pagamentos.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Habilita CORS
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // ✅ Libera OPTIONS para todas as rotas (preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 🔓 libera arquivos estáticos (frontend React)
                        .requestMatchers("/", "/index.html", "/assets/**", "/**.ico", "/**.png", "/**.svg", "/**.js", "/**.css").permitAll()
                        
                        // 🔓 libera todas as rotas do frontend SPA (React Router)
                        // A autenticação é feita no frontend via JWT token
                        .requestMatchers("/", "/login", "/admin", "/solicitante", "/escritorio", "/aprovador", "/expansao").permitAll()

                        // 🔓 libera login e cadastro
                        .requestMatchers("/api/auth/**").permitAll()

                        // 🔓 libera visualização de imagens (GET)
                        .requestMatchers(HttpMethod.GET, "/api/orcamento/*/imagens/*").permitAll()

                        // 🔐 somente ADMIN pode acessar
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/orcamento/gerar").hasAnyRole("ADMIN", "SOLICITANTE", "ESCRITORIO", "EXPANSAO")
                        .requestMatchers("/api/orcamento/aprovar").hasRole("APROVADOR")
                        .requestMatchers("/api/prestador/**").hasAnyRole("ADMIN", "SOLICITANTE", "EXPANSAO")

                        // 🔐 Grupos de Itens e Itens - ADMIN, ESCRITORIO e EXPANSAO
                        .requestMatchers("/api/grupo-itens/**").hasAnyRole("ADMIN", "ESCRITORIO", "EXPANSAO")
                        .requestMatchers("/api/itens/**").hasAnyRole("ADMIN", "ESCRITORIO", "EXPANSAO")

                        // 🔐 Empresas e Endereços - ADMIN e EXPANSAO
                        .requestMatchers("/api/empresa/**").hasAnyRole("ADMIN", "EXPANSAO")
                        .requestMatchers("/api/endereco/**").hasAnyRole("ADMIN", "ESCRITORIO", "EXPANSAO")

                        // 🔐 Dashboard - somente ADMIN
                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")

                        // 🔐 todo resto precisa estar autenticado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Quando frontend e backend estão no mesmo servidor (produção),
        // o CORS não é necessário, mas mantemos para desenvolvimento
        
        // Permite todas as origens para desenvolvimento
        // Em produção com arquivos estáticos, isso não afeta pois é same-origin
        configuration.addAllowedOriginPattern("*");
        
        // Permite métodos HTTP
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"
        ));

        // Permite headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With",
                "Cache-Control"
        ));

        // Permite envio de credenciais (cookies, headers de autorização)
        configuration.setAllowCredentials(true);

        // Expõe headers específicos para o cliente
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Disposition"
        ));

        // Define o tempo máximo de cache do preflight (em segundos)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}