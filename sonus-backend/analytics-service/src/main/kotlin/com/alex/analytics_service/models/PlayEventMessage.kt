package com.alex.analytics_service.models

data class PlayEventMessage (
    val userId: String,
    val songId: String,
    val artistId: String,
)