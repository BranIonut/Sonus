package com.alex.controllers

import com.alex.dtos.LoginRequest
import com.alex.dtos.SignupRequest
import com.alex.dtos.UpdateMetadataRequest
import com.alex.dtos.UserResponse
import com.alex.services.AuthUserService
import com.alex.services.JwtService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.util.UUID

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["*"])
class AuthController(private val authUserService: AuthUserService, private val jwtService: JwtService) {

    @PostMapping("/signup")
    fun signup(@RequestBody request: SignupRequest): Mono<ResponseEntity<Any>> {
        return authUserService.registerUser(request)
            .map { savedUser ->
                val response = UserResponse(savedUser.userId, savedUser.username, savedUser.email)
                ResponseEntity.status(HttpStatus.CREATED).body<Any>(response)
            }
            .onErrorResume(IllegalArgumentException::class.java) { e ->
                val errorJson = mapOf("error" to e.message)
                Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).body(errorJson))
            }
            .onErrorResume {
                Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build())
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

    @PutMapping("/users/{userId}")
    fun updateUserMetadata(
        @PathVariable userId: UUID,
        @RequestBody request: UpdateMetadataRequest
        ): Mono<ResponseEntity<UserResponse>>
    {
        return authUserService.updateUserMetadata(userId, request)
            .map { updatedUser ->
                val response = UserResponse(updatedUser.userId, updatedUser.username, updatedUser.email)
                ResponseEntity.status(HttpStatus.OK).body(response)
            }
            .defaultIfEmpty(ResponseEntity(HttpStatus.NOT_FOUND))
    }
}