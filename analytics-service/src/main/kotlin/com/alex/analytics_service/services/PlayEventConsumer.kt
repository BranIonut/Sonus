package com.alex.analytics_service.services

import com.alex.analytics_service.models.PlayEventDocument
import com.alex.analytics_service.models.PlayEventMessage
import com.alex.analytics_service.repositories.PlayEventRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Service

@Service
class PlayEventConsumer(
    private val playEventRepository: PlayEventRepository,
) {

    @KafkaListener(topics = ["song-play-events"], groupId = "analytics-group")
    fun consume(@Payload message: PlayEventMessage) {
        println("Received event: $message")

        val document = PlayEventDocument(
            userId = message.userId,
            songId = message.songId,
            artistId = message.artistId
        )

        playEventRepository.save(document).block()
    }
}