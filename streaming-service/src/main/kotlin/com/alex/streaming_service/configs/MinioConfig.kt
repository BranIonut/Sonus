package com.alex.streaming_service.configs

import io.minio.MinioClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class MinioConfig(
    @Value("\${minio.url}") private val url: String,

    @Value("\${minio.accessKey}") private val accessKey: String,

    @Value("\${minio.secretKey}") private val secretKey: String
) {
    @Bean
    fun minioClient(): MinioClient {
        return MinioClient.builder()
            .endpoint(this.url)
            .credentials(this.accessKey, this.secretKey)
            .build()
    }
}
