package com.alex.catalogservice.models

import org.springframework.data.annotation.Id
import java.util.UUID

data class Song(
    @Id val songId: String? = UUID.randomUUID().toString(),
    val title: String,
    val durationSeconds: Int,
    val objectKey: String? = null,
)