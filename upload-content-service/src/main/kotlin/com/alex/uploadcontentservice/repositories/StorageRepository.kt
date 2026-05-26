package com.alex.uploadcontentservice.repositories

import com.alex.uploadcontentservice.configs.MinioConfig
import io.minio.GetPresignedObjectUrlArgs
import io.minio.http.Method
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.util.concurrent.TimeUnit

@Repository
class StorageRepository(private val minioConfig: MinioConfig) {

    companion object {
        private const val SONGS_BUCKET = "songs"
        private const val COVERS_BUCKET = "album-covers"
        private const val ARTIST_BUCKET = "artist-covers"
        private const val PRESIGN_EXPIRY_MINUTES = 15
    }

    fun generateUploadUrl(objectKey: String): Mono<String> = presignedPutUrl(SONGS_BUCKET, objectKey)

    fun generateCoverUploadUrl(objectKey: String): Mono<String> = presignedPutUrl(COVERS_BUCKET, objectKey)

    fun generateArtistCoverUploadUrl(objectKey: String): Mono<String> = presignedPutUrl(ARTIST_BUCKET, objectKey)

    fun presignedPutUrl(bucket: String, objectKey: String): Mono<String> =
        Mono.fromCallable {
            minioConfig.minioClient().getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(bucket)
                    .`object`(objectKey)
                    .expiry(PRESIGN_EXPIRY_MINUTES, TimeUnit.MINUTES)
                    .build()
            )
        }.subscribeOn(Schedulers.boundedElastic())
}