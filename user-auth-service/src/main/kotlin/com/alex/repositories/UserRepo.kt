package com.alex.repositories

import com.alex.entities.User
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import java.util.UUID


@Repository
interface UserRepo : ReactiveCrudRepository<User, UUID> {
    fun findByEmail(email: String): Mono<User>
    fun findByUsername(username: String): Mono<User>

    fun existsByEmail(email: String): Mono<Boolean>
    fun existsByUsername(username: String): Mono<Boolean>
}