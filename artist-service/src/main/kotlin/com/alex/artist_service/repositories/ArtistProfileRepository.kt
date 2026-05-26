package com.alex.artist_service.repositories

import com.alex.artist_service.models.ArtistProfile
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface ArtistProfileRepository: ReactiveMongoRepository<ArtistProfile, String> {
    fun findByUserId(artistId: String): Mono<ArtistProfile>

    fun findByStageNameIgnoreCase(stageName: String): Mono<ArtistProfile>

    fun findByStageNameContainingIgnoreCase(stageName: String): Flux<ArtistProfile>

    fun findByGenre(genre: String): Flux<ArtistProfile>

    fun findByIsVerifiedTrue(): Flux<ArtistProfile>
}