package com.alex.services

import java.util.Date
import io.jsonwebtoken.Jwts
import javax.crypto.SecretKey
import com.alex.entities.User
import io.jsonwebtoken.Claims
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import org.springframework.beans.factory.annotation.Value
import javax.crypto.spec.SecretKeySpec

@Service
class JwtService(
    @Value("\${jwt.secret}") private val jwtSecret: String,
    @Value("\${jwt.expiration}") private val expiration: Long
) {


    private val secretKey: SecretKey by lazy {
        SecretKeySpec(jwtSecret.toByteArray(Charsets.UTF_8), "HmacSHA256")
    }


    fun generateToken(user: User): String {
        val now = Date()

        return Jwts.builder()
            .subject(user.userId.toString())
            .claim("username", user.username)
            .claim("role", user.role.name)
            .claim("hasActiveSubscription", user.hasActiveSubscription ?: false)
            .issuedAt(now)
            .expiration(Date(now.time + expiration))
            .signWith(secretKey)
        .compact()
    }

    fun isValid(token: String): Boolean {
        return try {
            val claims = extractAllClaims(token)
            !isTokenExpired(claims)
        } catch (e: Exception) {
            false
        }
    }

    fun extractUserId(token: String): String {
        return extractClaim(token, Claims::getSubject)
    }

    fun extractRole(token: String): String {
        return extractAllClaims(token)["role"] as String
    }

    fun hasActiveSubscription(token: String): Boolean {
        val claimValue = extractAllClaims(token)["hasActiveSubscription"]
        return claimValue as? Boolean ?: false
    }

    private fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }

    private fun extractAllClaims(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    private fun isTokenExpired(claims: Claims): Boolean {
        return claims.expiration.before(Date())
    }

}