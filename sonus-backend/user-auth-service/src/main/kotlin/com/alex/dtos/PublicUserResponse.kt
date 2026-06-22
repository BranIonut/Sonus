package com.alex.dtos

import com.alex.entities.Role
import java.util.UUID

data class PublicUserResponse(
    val userId: UUID?,
    val username: String,
    val name: String,
    val role: Role
)
