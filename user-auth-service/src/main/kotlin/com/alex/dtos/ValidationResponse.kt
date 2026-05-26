package com.alex.dtos

data class ValidationResponse(
    val id: String,
    val role: String,
    val hasActiveSubscription: Boolean
)


