package com.alex.apigateway.routing

import org.springframework.cloud.gateway.route.RouteLocator
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder
import org.springframework.cloud.gateway.route.builder.filters
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.cloud.gateway.route.builder.routes

@Configuration
class GatewayRoutesConfig {
    @Bean
    fun routes(builder: RouteLocatorBuilder): RouteLocator = builder.routes {

        route(id = "auth_service_route") {
            path("/api/auth/**")
            uri("http://user-auth-service:8080")
        }

        route(id = "streaming_service_route") {
            path("/streaming/**")
            uri("http://streaming-service:8080")
        }

        route(id = "artist_service_route") {
            path("/api/artists/**")
            uri("http://artist-service:8080")
        }

        route(id = "catalog_service_route") {
            path("/api/catalogs/**")
            uri("http://catalog-service:8080")
        }

        route(id = "user_library_service_route") {
            path("/api/library/**", "/api/playlists/**")
            uri("http://user-library-service:8080")
        }

        route(id = "upload_content_service_route") {
            path("/api/upload/**")
            uri("http://upload-content-service:8080")
        }

        route(id = "storage_route") {
            path("/storage/**")
            filters {
                rewritePath("/storage/(?<segment>.*)", "/\${segment}")
                removeRequestHeader("Authorization")
                removeRequestHeader("Cookie")
                dedupeResponseHeader("Access-Control-Allow-Origin", "RETAIN_UNIQUE")
                dedupeResponseHeader("Access-Control-Allow-Credentials", "RETAIN_UNIQUE")
                removeRequestHeader("X-Forwarded-For")

            }
            uri("http://minio:9000")
        }
    }
}