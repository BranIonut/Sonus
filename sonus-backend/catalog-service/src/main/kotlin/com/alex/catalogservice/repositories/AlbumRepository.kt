package com.alex.catalogservice.repositories

import com.alex.catalogservice.models.Album
import org.springframework.data.mongodb.repository.Query
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface AlbumRepository : ReactiveMongoRepository<Album, String> {
    fun findByArtistId(artistId: String): Flux<Album>

    fun findByGenreIgnoreCase(genre: String): Flux<Album>

    fun findByGenreIgnoreCaseOrderByReleaseDateDesc(genre: String): Flux<Album>

    fun findAllByOrderByReleaseDateDesc(): Flux<Album>

    fun findByTitleContainingIgnoreCase(title: String): Flux<Album>
    @Query("{ 'songs.songId': ?0 }")

    fun findBySongId(songId: String): Mono<Album>

    fun findByTitleContainingIgnoreCaseAndGenreIgnoreCase(title: String, genre: String): Flux<Album>

}