package com.alex.analytics_service.repositories

import com.alex.analytics_service.models.PlayEventDocument
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface PlayEventRepository: ReactiveCrudRepository<PlayEventDocument, String> {
    fun findByUserId(userId: String): Flux<PlayEventDocument>
}