package com.alex.artist_service.controllers

import com.alex.artist_service.models.ArtistProfile
import com.alex.artist_service.services.ArtistService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/artists")
@Tag(name = "Artist Management API", description = "Artist metadata management")
class ArtistController(
    private val artistService: ArtistService
) {

    @GetMapping
    @Operation(summary = "Find all artists")
    fun getAllArtists(): Mono<ResponseEntity<List<ArtistProfile>>> =
        artistService.getAllArtists()
            .collectList()
            .map { ResponseEntity.ok(it) }

    @GetMapping("/search")
    @Operation(summary = "Search Artists by its stage name")
    fun searchArtists(@RequestParam query: String): Mono<ResponseEntity<List<ArtistProfile>>> =
        artistService.searchArtists(query)
            .collectList()
            .map { ResponseEntity.ok(it) }

    @GetMapping("/{userId}")
    @Operation(summary = "Get artist profile by id")
    fun getArtistProfile(@PathVariable userId: String): Mono<ResponseEntity<ArtistProfile>> =
        artistService.getArtistProfile(userId)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.notFound().build())

    @PutMapping("/{userId}")
    fun updateArtistProfile(
        @PathVariable userId: String,
        @RequestHeader("X-User-Id") authenticatedUserId: String,
        @RequestBody artistProfile: ArtistProfile
    ): Mono<ResponseEntity<ArtistProfile>> {
        if (userId != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }

        return artistService.updateArtistProfile(artistProfile.copy(userId = userId))
            .map { ResponseEntity.ok(it) }
    }

    @DeleteMapping("/{userId}")
    fun deleteArtistProfile(
        @PathVariable userId: String,
        @RequestHeader("X-User-Id") authenticatedUserId: String,
    ): Mono<ResponseEntity<Void>> {
        if (userId != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }

        return artistService.deleteArtist(userId).then(Mono.just(ResponseEntity.ok<Void>(null)))
    }
}