package com.alex.services

import com.alex.dtos.LoginRequest
import com.alex.dtos.SignupRequest
import com.alex.dtos.UpdateMetadataRequest
import com.alex.entities.User
import com.alex.repositories.UserRepo
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono
import java.util.UUID


@Service
class AuthUserService(
    private val userRepo: UserRepo,
    private val passwordEncoder: PasswordEncoder
) {

    fun registerUser(request: SignupRequest): Mono<User> {

        return userRepo.existsByEmail(request.email)
            .flatMap { emailExists ->
                if(emailExists) {
                    Mono.error { IllegalArgumentException("Email already used by another user") }
                } else {
                    userRepo.existsByUsername(request.username)
                }
            }
            .flatMap { usernameExists ->
                if(usernameExists) {
                    Mono.error(IllegalArgumentException("Username already in use"))
                } else {
                    val newUser = User(
                        username = request.username,
                        email = request.email,
                        password = passwordEncoder.encode(request.password)
                    )
                    userRepo.save(newUser)
                }
            }


    }

    fun authenticateUser(request: LoginRequest): Mono<User> {
        return userRepo.findByUsername(request.username)
            .filter { user ->
                passwordEncoder.matches(request.password, user.password)
            }
    }

    fun updateUserMetadata(userId: UUID, request: UpdateMetadataRequest): Mono<User> {
        return userRepo.findById(userId)
            .flatMap { existingUser ->
                val newPasswordHash = if (!request.password.isNullOrBlank()) {
                    passwordEncoder.encode(request.password)
                } else {
                    existingUser.password
                }

                val updatedUser = existingUser.copy(
                    username = request.username ?: existingUser.username,
                    email = request.email ?: existingUser.email,
                    password = newPasswordHash
                )
                userRepo.save(updatedUser)
            }
    }

    fun getUserByEmail(email: String): Mono<User> {
        return userRepo.findByEmail(email)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found!")))
    }
}