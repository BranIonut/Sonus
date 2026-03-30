package com.alex.analytics_service.services

import com.alex.analytics_service.models.PlayEventDocument
import com.alex.analytics_service.repositories.PlayEventRepository
import org.springframework.kafka.annotation.KafkaListener
import org.springframework.stereotype.Service

@Service
class PlayEventConsumer(private val playEventRepository: PlayEventRepository) {

    @KafkaListener(topics = ["song-play-events"], groupId = "analytics-group")
    fun consume(message: String) {
        println("Received event: $message")

        val parts = message.split(" played ")

        if(parts.size == 2) {
            val userId = parts[0]
            val songId = parts[1]

            val eventDocument = PlayEventDocument(
                userId = userId,
                songId = songId,
            )

            playEventRepository.save(eventDocument).subscribe(
                { savedDoc -> println("Saved event with ID: ${savedDoc.id}") },
                { error -> println("Error while saving event with ID: ${error.message}") }
            )
        } else {
            println("Message won't respect the required format: $message")
        }
    }
}