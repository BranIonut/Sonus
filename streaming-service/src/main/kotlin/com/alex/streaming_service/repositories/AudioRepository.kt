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

    fun getAudioMetadata(songId: String): Mono<Long> {
        return Mono.fromCallable {
            minioConfig.minioClient().statObject(
                StatObjectArgs.builder()
                    .bucket("songs")
                    .`object`("$songId.m4a")
                    .build()
            ).size()
        }.subscribeOn(Schedulers.boundedElastic())
    }

    fun getAudioFile(songId: String, offset: Long, length: Long): Flux<DataBuffer> {

        return Flux.using<DataBuffer, io.minio.GetObjectResponse>(
            {
                minioConfig.minioClient().getObject(
                    GetObjectArgs.builder()
                        .bucket("songs")
                        .`object`("$songId.m4a")
                        .offset(offset)
                        .length(length)
                        .build()
                )
            },
            {inputStream ->
                DataBufferUtils.readInputStream(
                    {inputStream},
                    DefaultDataBufferFactory(),
                    8192
                )
            },
            {inputStream ->
                try {
                    inputStream.close()
                } catch (e: IOException) {
                    //logging error
                }
            }
        ).subscribeOn(Schedulers.boundedElastic())

    }
}