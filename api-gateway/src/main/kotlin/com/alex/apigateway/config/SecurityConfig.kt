package com.alex.apigateway.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.security.oauth2.server.resource.web.server.authentication.ServerBearerTokenAuthenticationConverter
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsConfigurationSource
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import javax.crypto.spec.SecretKeySpec

@Configuration
@EnableWebFluxSecurity
class SecurityConfig {

    @Value("\${jwt.secret}")
    lateinit var jwtSecret: String

    @Bean
    fun springSecurityFilterChain(http: ServerHttpSecurity): SecurityWebFilterChain {
        http
            .cors { it.configurationSource(corsConfigurationSource()) }
            .csrf { it.disable() }
            .authorizeExchange { exchanges ->
                exchanges
                    .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()


                    .pathMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/validate").permitAll()

                    .pathMatchers(HttpMethod.GET, "/storage/**").permitAll()
                    .pathMatchers(HttpMethod.PUT, "/storage/**").permitAll()
                    .pathMatchers(HttpMethod.PATCH, "/storage/**").permitAll()

                    .pathMatchers(HttpMethod.GET, "/api/catalogs/**").permitAll()

                    .pathMatchers(HttpMethod.GET, "/api/artists/**").permitAll()

                    .anyExchange().authenticated()
            }
            .oauth2ResourceServer { oauth2 ->
                oauth2.jwt { jwt -> jwt.jwtDecoder(jwtDecoder()) }
                oauth2.bearerTokenConverter(bearerTokenConverter())
            }

        return http.build()
    }

    @Bean
    fun bearerTokenConverter(): ServerAuthenticationConverter {
        val converter = ServerBearerTokenAuthenticationConverter()
        converter.setAllowUriQueryParameter(true)
        return converter
    }


    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = listOf("*")
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = false

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }

    @Bean
    fun jwtDecoder(): ReactiveJwtDecoder {
        val secretKey = SecretKeySpec(jwtSecret.toByteArray(Charsets.UTF_8), "HmacSHA256")
        return NimbusReactiveJwtDecoder.withSecretKey(secretKey).build()
    }
}