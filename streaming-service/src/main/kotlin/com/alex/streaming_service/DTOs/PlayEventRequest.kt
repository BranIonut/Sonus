package com.alex.streaming_service.DTOs

data class PlayEventRequest(
    val songId: String,
    val userId: String,
    val listenDurationSeconds: Int
)