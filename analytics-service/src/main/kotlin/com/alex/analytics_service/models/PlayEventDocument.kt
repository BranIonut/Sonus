package com.alex.analytics_service.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "play_events")
data class PlayEventDocument (
    @Id val id: String? = null,
    val userId: String,
    val songId: String,
    val artistId: String,
    val timestamp: Instant = Instant.now()
)