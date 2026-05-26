package com.alex.uploadcontentservice.repositories

import com.alex.uploadcontentservice.models.SongMetadata
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface SongMetadataRepository: ReactiveCrudRepository<SongMetadata, String> {
    fun findByArtistId(artistId: String): Flux<SongMetadata>

    fun findByAlbumId(albumId: String): Flux<SongMetadata>
}