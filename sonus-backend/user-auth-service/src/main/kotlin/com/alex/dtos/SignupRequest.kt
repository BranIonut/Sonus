package com.alex.dtos

import com.alex.entities.Role
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

data class SignupRequest(
    val username: String,
    val name: String,
    @Email
    val email: String,
    @Size(min = 8, max = 24)
    val password: String,
    val role: Role
)