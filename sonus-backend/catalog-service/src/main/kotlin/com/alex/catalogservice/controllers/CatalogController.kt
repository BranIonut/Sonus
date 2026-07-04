package com.alex.catalogservice.controllers

import com.alex.catalogservice.dtos.SearchResultDto
import com.alex.catalogservice.models.Album
import com.alex.catalogservice.models.Song
import com.alex.catalogservice.services.CatalogService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono
import java.security.Principal

@RestController
@RequestMapping(value = ["/api/catalogs"])
@Tag(name = "Catalog Management API", description = "Albums and Songs metadata management")
class CatalogController(private val catalogService: CatalogService) {

    @GetMapping("/search")
    @Operation(summary = "Search songs and albums by query string")
    fun search(@RequestParam query: String): Mono<ResponseEntity<SearchResultDto>> =
        catalogService.search(query)
            .map { ResponseEntity.ok(it) }

    @GetMapping("/albums")
    fun getAllAlbums(
        @RequestParam(required = false) genre: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): Mono<ResponseEntity<List<Album>>> =
        catalogService.getAlbums(genre, page, size)
            .collectList()
            .map { ResponseEntity.ok(it) }

    @PostMapping("/albums")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new empty album")
    fun createAlbum(
        @RequestHeader("X-User-Id") artistId: String,
        @RequestBody album: Album
    ): Mono<ResponseEntity<Album>> =
        catalogService.createAlbum(album.copy(artistId = artistId))
            .map { ResponseEntity.status(HttpStatus.CREATED).body(it) }

    @GetMapping("/albums/{albumId}")
    @Operation(summary = "Get complete album with its songs")
    fun getFullAlbum(@PathVariable albumId: String): Mono<ResponseEntity<Album>> =
        catalogService.getAlbumById(albumId)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build())

    @GetMapping("/artists/{artistId}/albums")
    fun getArtistAlbums(@PathVariable artistId: String): Mono<ResponseEntity<List<Album>>> =
        catalogService.getAlbumsByArtistId(artistId)
            .collectList()
            .map { albums -> ResponseEntity.ok(albums) }


    @PostMapping("/albums/{albumId}/songs")
    @Operation(summary = "Add new song to an existing album")
    fun addSongToAlbum(
        @PathVariable albumId: String,
        @RequestHeader("X-User-Id") artistId: String,
        @RequestBody song: Song
    ): Mono<ResponseEntity<Album>> =
        catalogService.addSongToAlbum(albumId, artistId, song)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.FORBIDDEN).build())

    @GetMapping("/songs/{songId}")
    @Operation(summary = "Get song by id - used by streaming-service to resolve objectKey")
    fun getSong(@PathVariable songId: String): Mono<ResponseEntity<Song>> =
        catalogService.getSongById(songId)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build())


}