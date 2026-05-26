package com.alex.userlibraryservice.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "playlists")
data class Playlist(
    @Id var id: String? = null,
    val userId: String,
    val title: String,
    val description: String?,
    val creationDate: Instant = Instant.now(),
    val songs: List<String> = emptyList(),
)
