package com.alex.streaming_service.repositories
import com.alex.streaming_service.configs.MinioConfig
import io.minio.GetObjectArgs
import io.minio.StatObjectArgs
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.buffer.DataBufferUtils
import org.springframework.core.io.buffer.DefaultDataBufferFactory
import org.springframework.stereotype.Repository
import org.springframework.core.io.buffer.DataBuffer
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers
import java.io.IOException

@Repository
class AudioRepository {

    @Autowired
    private lateinit var minioConfig: MinioConfig

    companion object {
        private const val BUCKET = "songs"
        private const val BUFFER_SIZE = 8192
    }

    // objectKey = "{artistId}/{albumId}/{songId}.m4a"
    fun getAudioSize(objectKey: String): Mono<Long> {
        return Mono.fromCallable {
            minioConfig.minioClient().statObject(
                StatObjectArgs.builder()
                    .bucket(BUCKET)
                    .`object`(objectKey)
                    .build()
            ).size()
        }.subscribeOn(Schedulers.boundedElastic())
    }

    fun getAudioStream(objectKey: String, offset: Long, length: Long): Flux<DataBuffer> {
        return Flux.using(
            {
                minioConfig.minioClient().getObject(
                    GetObjectArgs.builder()
                        .bucket(BUCKET)
                        .`object`(objectKey)
                        .offset(offset)
                        .length(length)
                        .build()
                )
            },
            { inputStream ->
                DataBufferUtils.readInputStream(
                    { inputStream },
                    DefaultDataBufferFactory(),
                    BUFFER_SIZE
                )
            },
            { inputStream ->
                try { inputStream.close() }
                catch (e: IOException) {
                    //log error mai tarziu fac si aici...
                }
            }
        ).subscribeOn(Schedulers.boundedElastic())
    }
}