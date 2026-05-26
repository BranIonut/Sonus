package com.alex.uploadcontentservice.models

import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document
import java.time.Instant
import java.time.LocalDateTime


@Document(collection = "song_metadata")
data class SongMetadata(
    @Id val id: String? = null,
    val artistId: String,
    val albumId: String,
    var title: String? = null,
    val durationSeconds: Int? = null,
    val objectKey: String? = null,
    var isExplicit: Boolean = false,
    var features: String? = null,
    var trackNumber: Int? = null,
    var uploadStatus: UploadStatus = UploadStatus.PENDING,
    val createdAt: Instant = Instant.now()
)

enum class UploadStatus { PENDING, COMPLETED }
