package com.alex.catalogservice.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant

@Document(collection = "albums")
data class Album(
    @Id val albumId: String? = null,
    var artistId: String = "",
    val title: String,
    val description: String? = null,
    val genre: String,
    val releaseDate: Instant = Instant.now(),
    val recordLabel: String? = null,
    val copyright: String? = null,
    val coverUrl: String? = null,
    val type: ReleaseType,
    val songs: List<Song> = emptyList(),
)