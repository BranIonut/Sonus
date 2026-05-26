package com.alex.uploadcontentservice.dtos

data class InitUploadRequest(
    val albumId: String,
    val extension: String = "m4a"
)

data class InitUploadResponse(
    val songId: String,
    val presignedUrl: String,
    val expiresInSeconds: Int = 900
)

data class ConfirmUploadRequest(
    val songId: String,
    val albumId: String,
    val title: String,
    val durationSeconds: Int,
    val isExplicit: Boolean,
    val features: String,
    val trackNumber: Int
)

data class CoverUploadResponse(
    val presignedUrl: String,
    val coverUrl: String,
    val expiresInSeconds: Int = 900
)

data class SongUploadedEvent(
    val songId: String,
    val artistId: String?,
    val albumId: String,
    val title: String,
    val durationSeconds: Int,
    val objectKey: String,
)