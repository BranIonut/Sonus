package com.alex.analytics_service.dtos

data class UserStatsDto(
    val userId: String,
    val totalPlays: Long,
    val uniqueSongs: Long,
    val uniqueArtists: Long,
    val topSongs: List<RankedEntry>,
    val topArtists: List<RankedEntry>
)
