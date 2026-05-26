package com.alex.userlibraryservice.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "user_libraries")
data class UserLibrary(
    @Id var userId: String,
    val likedSongs: Set<String> = emptySet(),
    val savedAlbums: Set<String> = emptySet(),
)
