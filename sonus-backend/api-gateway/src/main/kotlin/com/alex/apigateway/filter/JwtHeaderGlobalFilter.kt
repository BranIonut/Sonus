package com.alex.apigateway.filter

import org.springframework.cloud.gateway.filter.GatewayFilterChain
import org.springframework.cloud.gateway.filter.GlobalFilter
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@Component
class JwtHeaderGlobalFilter: GlobalFilter {

    override fun filter(exchange: ServerWebExchange, chain: GatewayFilterChain): Mono<Void> {
        return ReactiveSecurityContextHolder.getContext()
            .mapNotNull { it.authentication?.principal as? Jwt }
            .map { jwt ->
                val userId = jwt?.subject ?: ""
                val hasActiveSub = jwt?.claims["hasActiveSubscription"]?.toString() ?: "false"

                println("========= DEBUG GATEWAY =========")
                println("Token interceptat pentru User ID: $userId")
                println("Abonament activ (din token): $hasActiveSub")
                println("=================================")

                val mutatedRequest = exchange.request.mutate()
                    .header("X-User-Id", userId)
                    .header("X-Has-Active-Sub", hasActiveSub)
                    .build()

                exchange.mutate().request(mutatedRequest).build()
            }
            .defaultIfEmpty(exchange)
            .flatMap { mutatedExchange ->
                chain.filter(mutatedExchange)
            }
    }
}