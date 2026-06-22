package com.alex.analytics_service.dtos

import java.time.Instant

data class PlayHistoryEntry(
    val songId: String,
    val artistId: String,
    val playedAt: Instant
)
