package com.alex.analytics_service.dtos

data class ArtistStatsDto (
    val artistId: String,
    val totalPlays: Long,
    val uniqueListeners: Long,
)