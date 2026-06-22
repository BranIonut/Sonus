package com.alex.userlibraryservice.controllers

import com.alex.userlibraryservice.dtos.CreatePlaylistRequest
import com.alex.userlibraryservice.models.Playlist
import com.alex.userlibraryservice.services.LibraryService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/playlists")
class PlaylistController(private val libraryService: LibraryService) {

    @GetMapping("/me")
    fun getMyPlaylists(@RequestHeader("X-User-Id") userId: String): Mono<ResponseEntity<List<Playlist>>> =
        libraryService.getUserPlaylists(userId).collectList().map { ResponseEntity.ok(it) }

    @PostMapping
    fun createPlaylist(
        @RequestHeader("X-User-Id") userId: String,
        @RequestBody request: CreatePlaylistRequest
    ): Mono<ResponseEntity<Playlist>> =
        libraryService.createPlaylist(userId, request.title, request.description)
            .map { ResponseEntity.status(HttpStatus.CREATED).body(it) }

    @PostMapping("/{playlistId}/songs/{songId}")
    fun addSongToPlaylist(
        @RequestHeader("X-User-Id") userId: String,
        @PathVariable playlistId: String,
        @PathVariable songId: String,
    ): Mono<ResponseEntity<Playlist>> = libraryService.addSongToPlaylist(userId, playlistId, songId)
        .map { ResponseEntity.ok(it) }

    @DeleteMapping("/{playlistId}/songs/{songId}")
    fun removeSongFromPlaylist(
        @RequestHeader("X-User-Id") userId: String,
        @PathVariable playlistId: String,
        @PathVariable songId: String,
    ): Mono<ResponseEntity<Playlist>> = libraryService.removeSongFromPlaylist(userId, playlistId, songId)
        .map { ResponseEntity.ok(it) }
}