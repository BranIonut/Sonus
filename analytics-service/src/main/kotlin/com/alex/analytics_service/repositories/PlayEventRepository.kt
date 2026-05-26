package com.alex.analytics_service.repositories

import com.alex.analytics_service.models.PlayEventDocument
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface PlayEventRepository: ReactiveCrudRepository<PlayEventDocument, String> {
    fun findByUserId(userId: String): Flux<PlayEventDocument>

    fun findByUserIdOrderByTimestampDesc(userId: String): Flux<PlayEventDocument>

    fun findByArtistId(artistId: String): Flux<PlayEventDocument>

    fun countBySongId(songId: String): Mono<Long>

    fun countByArtistId(artistId: String): Mono<Long>

    fun countByUserId(userId: String): Mono<Long>
}