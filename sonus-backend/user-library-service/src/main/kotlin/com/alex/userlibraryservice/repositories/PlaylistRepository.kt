package com.alex.userlibraryservice.repositories

import com.alex.userlibraryservice.models.Playlist
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface PlaylistRepository: ReactiveMongoRepository<Playlist, String> {
    fun findByUserId(userId: String): Flux<Playlist>
}