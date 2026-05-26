package com.alex.controllers

import java.util.UUID
import com.alex.dtos.UserResponse
import com.alex.dtos.LoginRequest
import com.alex.dtos.PublicUserResponse
import reactor.core.publisher.Mono
import com.alex.dtos.SignupRequest
import com.alex.services.JwtService
import com.alex.services.AuthUserService
import com.alex.dtos.UpdateMetadataRequest
import com.alex.dtos.ValidationResponse

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.PostMapping

import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authUserService: AuthUserService, private val jwtService: JwtService) {

    @PostMapping("/signup")
    fun signup(@RequestBody request: SignupRequest): Mono<ResponseEntity<Any>> {
        return authUserService.registerUser(request)
            .map { savedUser ->
                val response = UserResponse(savedUser.userId, savedUser.username, savedUser.name, savedUser.email)
                ResponseEntity.status(HttpStatus.CREATED).body<Any>(response)
            }
            .onErrorResume(IllegalArgumentException::class.java) { e ->
                val errorJson = mapOf("error" to e.message)
                Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorJson))
            }
            .onErrorResume { e ->
                e.printStackTrace()

                val errorJson = mapOf("error" to (e.message ?: "Unknown error"))

                Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorJson))
            }
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): Mono<ResponseEntity<String>> {
        return authUserService.authenticateUser(request)
            .map { authUser ->
                val token = jwtService.generateToken(authUser)
                ResponseEntity.status(HttpStatus.OK).body(token)
            }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build())
    }

    @GetMapping("/users/{userId}")
    fun getUserById(
        @PathVariable userId: UUID,
        @RequestHeader("X-User-Id") authenticatedUserId: String
    ): Mono<ResponseEntity<UserResponse>> {
        if (userId.toString() != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }
        return authUserService.getUserById(userId)
            .map { user ->
                ResponseEntity.ok(UserResponse(user.userId, user.username, user.name, user.email))
            }
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @PostMapping("/users/{userId}/upgrade-to-artist")
    fun upgradeToArtist(
        @PathVariable userId: UUID,
        @RequestHeader("X-User-Id") authenticatedUserId: String
    ): Mono<ResponseEntity<Map<String, String>>> {
        if (userId.toString() != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }
        return authUserService.upgradeUserToArtist(userId)
            .map { upgradedUser ->
                val newToken = jwtService.generateToken(upgradedUser)
                ResponseEntity.ok(mapOf(
                    "message" to "Successfully upgraded to ARTIST",
                    "token" to newToken
                ))
            }
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @PostMapping("/users/{userId}/subscription")
    fun updateSubscription(
        @PathVariable userId: UUID,
        @RequestHeader("X-User-Id") authenticatedUserId: String,
        @RequestParam(defaultValue = "true") active: Boolean
    ): Mono<ResponseEntity<Map<String, String>>> {
        if (userId.toString() != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }
        return authUserService.updateSubscription(userId, active)
            .map { updatedUser ->
                val newToken = jwtService.generateToken(updatedUser)
                val message = if (active) "Subscription activated" else "Subscription cancelled"
                ResponseEntity.ok(mapOf(
                    "message" to message,
                    "token" to newToken
                ))
            }
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @PutMapping("/users/{userId}")
    fun updateUserMetadata(
        @PathVariable userId: UUID,
        @RequestHeader("X-User-Id") authenticatedUserId: String,
        @RequestBody request: UpdateMetadataRequest
    ): Mono<ResponseEntity<Map<String, String>>> {
        if (userId.toString() != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }
        return authUserService.updateUserMetadata(userId, request)
            .map { updatedUser ->
                val newToken = jwtService.generateToken(updatedUser)
                mapOf(
                    "userId" to updatedUser.userId.toString(),
                    "username" to updatedUser.username,
                    "email" to updatedUser.email,
                    "token" to newToken
                )
            }
            .map { ResponseEntity.ok(it) }
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @PostMapping("/validate")
    fun validateToken(@RequestBody payload: Map<String, String>): ResponseEntity<ValidationResponse> {

        val token = payload["token"] ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val isValid = jwtService.isValid(token)
        println("Token received: $token")
        println("Token valid: $isValid")

        if (!isValid)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val userId = jwtService.extractUserId(token)
        val role = jwtService.extractRole(token)
        val hasActiveSubscription = jwtService.hasActiveSubscription(token)

        return ResponseEntity.ok(ValidationResponse(userId, role, hasActiveSubscription))
    }

    @DeleteMapping("/users/{userId}")
    fun deleteUser(
        @PathVariable userId: UUID,
        @RequestHeader("X-User-Id") authenticatedUserId: String
    ): Mono<ResponseEntity<Void>> {
        if (userId.toString() != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }
        return authUserService.deleteUser(userId)
            .then(Mono.just(ResponseEntity.noContent().build<Void>()))
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @GetMapping("/users")
    fun getUserByUsername(
        @RequestParam username: String
    ): Mono<ResponseEntity<PublicUserResponse>> {
        return authUserService.getUserByUsername(username)
            .map { user ->
                ResponseEntity.ok(PublicUserResponse(user.userId, user.username, user.name, user.role))
            }
            .onErrorResume(UsernameNotFoundException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }

    @GetMapping("/users/search")
    fun searchUsers(
        @RequestParam q: String,
        @RequestParam(defaultValue = "10") limit: Int
    ): Flux<PublicUserResponse> {
        return authUserService.searchUsersByUsername(q, limit)
            .map { user -> PublicUserResponse(user.userId, user.username, user.name, user.role) }
    }

}