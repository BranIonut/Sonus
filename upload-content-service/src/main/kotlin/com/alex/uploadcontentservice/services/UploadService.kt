package com.alex.uploadcontentservice.services

import com.alex.uploadcontentservice.dtos.ConfirmUploadRequest
import com.alex.uploadcontentservice.dtos.CoverUploadResponse
import com.alex.uploadcontentservice.dtos.InitUploadResponse
import com.alex.uploadcontentservice.dtos.SongUploadedEvent
import com.alex.uploadcontentservice.models.SongMetadata
import com.alex.uploadcontentservice.models.UploadStatus
import com.alex.uploadcontentservice.repositories.SongMetadataRepository
import com.alex.uploadcontentservice.repositories.StorageRepository
import org.bson.types.ObjectId
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class UploadService(
    private val storageRepository: StorageRepository,
    private val songMetadataRepository: SongMetadataRepository,
    @Value("\${minio.public-url:http://localhost:9094/storage}")
    private val minioPublicUrl: String
) {
    fun initUpload(artistId: String, albumId: String, extension: String): Mono<InitUploadResponse> {
        val songId = ObjectId().toHexString()

        val objectKey = "$artistId/$albumId/$songId.$extension"

        val pending = SongMetadata(
            id = songId,
            artistId = artistId,
            albumId = albumId,
            objectKey = objectKey
        )

        return songMetadataRepository.save(pending)
            .flatMap { saved ->
                storageRepository.generateUploadUrl(objectKey)
                    .map { url ->
                        InitUploadResponse(songId = songId, presignedUrl = url)
                    }
            }
    }

    fun confirmUpload(request: ConfirmUploadRequest, artistId: String): Mono<SongMetadata> {
        return songMetadataRepository.findById(request.songId)
            .filter { it.artistId == artistId }
            .flatMap { song ->
                songMetadataRepository.save(
                    song.copy(
                        title = request.title,
                        durationSeconds = request.durationSeconds,
                        isExplicit = request.isExplicit,
                        features = request.features,
                        trackNumber = request.trackNumber,
                        uploadStatus = UploadStatus.COMPLETED,
                    )
                ).doOnSuccess { savedSong ->
                    val event = SongUploadedEvent(
                        songId = savedSong?.id!!,
                        artistId = savedSong.artistId,
                        albumId = savedSong.albumId,
                        title = savedSong.title!!,
                        durationSeconds = savedSong.durationSeconds!!,
                        objectKey = savedSong.objectKey!!
                    )

                }
            }
    }

    fun initCoverUpload(artistId: String, albumId: String): Mono<CoverUploadResponse> {
        return storageRepository.generateCoverUploadUrl(albumId)
            .map { presignedUrl ->
                CoverUploadResponse(
                    presignedUrl = presignedUrl,
                    coverUrl = "$minioPublicUrl/album-covers/$albumId",
                )
            }
    }
}