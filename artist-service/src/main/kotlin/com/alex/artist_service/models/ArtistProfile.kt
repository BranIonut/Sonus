package com.alex.artist_service.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "artist_profiles")
data class ArtistProfile(
    @Id
    val userId: String,
    val stageName: String,
    val bio: String? = null,
    val contactEmail: String? = null,
    val socialLinks: Map<String, String>? = emptyMap()
)
