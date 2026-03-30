package com.alex.dtos

import java.util.UUID

data class UserResponse(
    val userId: UUID?,
    val username: String,
    val email: String
)
