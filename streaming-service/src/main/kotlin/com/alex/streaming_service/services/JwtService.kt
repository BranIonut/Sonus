package com.alex.streaming_service.services

import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class JwtService(
    @Value("\${jwt.secret}") private val secret: String) {

    private val key = Keys.hmacShaKeyFor(secret.toByteArray())

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parserBuilder()
            .setSigningKey(key)
            .build()
            .parseClaimsJws(token)
            .body
    }

    fun isValid(token: String): Boolean {
        return try {
            extractAllClaims(token)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun extractUserId(token: String): String {
        val claims = extractAllClaims(token)

        return claims.get("user_id", String::class.java) ?: claims.subject
    }

    fun hasActiveSubscription(token: String): Boolean {
        val claims = extractAllClaims(token)

            val subscription = claims.get("subscription", String::class.java)

        return subscription != "none"
    }

}