package com.alex.streaming_service.services

import org.springframework.kafka.core.KafkaTemplate
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class KafkaService(
    private val kafkaTemplate: KafkaTemplate<String, String>
) {
    fun sendPlayEvent(userId: String, songId: String): Mono<Void> {
        val topic = "song-play-events"
        val message = "$userId played $songId"

        return Mono.fromFuture(kafkaTemplate.send(topic, userId, message))
            .then()
    }
}