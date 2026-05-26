package com.alex.dtos

data class UpdateMetadataRequest(
    val username: String?,
    val name: String?,
    val email: String?,
    val password: String?
)
