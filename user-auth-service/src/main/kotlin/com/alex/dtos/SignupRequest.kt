package com.alex.dtos

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size

data class SignupRequest(
    val username: String,
    @Email
    val email: String,
    @Size(min = 8, max = 24)
    val password: String
)