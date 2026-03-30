package com.alex.entities

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime
import java.util.UUID

@Table("users")
data class User (
    @Id
    val userId: UUID? = null,
    val username: String,
    val email: String,
    val password: String?,
    val role: Role = Role.USER,
    val registrationDate: LocalDateTime? = null,
)