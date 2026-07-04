package com.alex.services

import com.alex.dtos.LoginRequest
import com.alex.dtos.SignupRequest
import com.alex.dtos.UpdateMetadataRequest
import com.alex.entities.Role
import com.alex.entities.User
import com.alex.repositories.UserRepo
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.UUID


@Service
class AuthUserService(
    private val userRepo: UserRepo,
    private val passwordEncoder: PasswordEncoder
) {

    fun registerUser(request: SignupRequest): Mono<User> {

        if(request.role == Role.ADMIN) {
            return Mono.error(IllegalAccessException("Don't have permissions to register as an admin!"))
        }

        return userRepo.existsByEmail(request.email)
            .flatMap { emailExists ->
                if (emailExists) {
                    Mono.error { IllegalArgumentException("Email already used by another user") }
                } else {
                    userRepo.existsByUsername(request.username)
                }
            }
            .flatMap { usernameExists ->
                if (usernameExists) {
                    Mono.error(IllegalArgumentException("Username already in use"))
                } else {
                    val newUser = User(
                        username = request.username,
                        name = request.name,
                        email = request.email,
                        password = passwordEncoder.encode(request.password),
                        role = request.role
                    )
                    userRepo.save(newUser)
                }
            }


    }

    fun authenticateUser(request: LoginRequest): Mono<User> {
        return userRepo.findByUsername(request.username)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
            .flatMap { user ->
                if (passwordEncoder.matches(request.password, user.password)) {
                    Mono.just(user)
                } else {
                    Mono.error(Exception("Invalid password"))
                }
            }
    }

    fun getUserById(userId: UUID): Mono<User> {
        return userRepo.findById(userId)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
    }

    fun getUserByEmail(email: String): Mono<User> {
        return userRepo.findByEmail(email)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
    }

    fun getUserByUsername(username: String): Mono<User> {
        return userRepo.findByUsername(username)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User '$username' not found")))
    }

    fun searchUsersByUsername(query: String, limit: Int): Flux<User> {
        val trimmed = query.trim()
        if (trimmed.isBlank()) return Flux.empty()
        return userRepo.findByUsernameContainingIgnoreCaseOrderByUsername(trimmed)
            .take(limit.coerceIn(1, 50).toLong())
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
                    name = request.name ?: existingUser.name,
                    email = request.email ?: existingUser.email,
                    password = newPasswordHash
                )
                userRepo.save(updatedUser)
            }
    }


    fun upgradeUserToArtist(userId: UUID): Mono<User> {
        return userRepo.findById(userId)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
            .flatMap { existingUser ->
                if (existingUser.role == Role.ARTIST) {
                    Mono.just(existingUser)
                } else {
                    userRepo.save(existingUser.copy(role = Role.ARTIST))
                }
            }
    }

    fun updateSubscription(userId: UUID, active: Boolean): Mono<User> {
        return userRepo.findById(userId)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
            .flatMap { existingUser ->
                if (existingUser.hasActiveSubscription == active) {
                    Mono.just(existingUser)
                } else {
                    userRepo.save(existingUser.copy(hasActiveSubscription = active))
                }
            }
    }

    fun deleteUser(userId: UUID): Mono<Void> {
        return userRepo.findById(userId)
            .switchIfEmpty(Mono.error(UsernameNotFoundException("User not found")))
            .flatMap { userRepo.delete(it) }
    }
}