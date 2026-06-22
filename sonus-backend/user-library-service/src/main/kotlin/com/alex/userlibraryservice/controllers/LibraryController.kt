package com.alex.userlibraryservice.controllers

import com.alex.userlibraryservice.models.UserLibrary
import com.alex.userlibraryservice.services.LibraryService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.userdetails.User
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/library")
class LibraryController(private val libraryService: LibraryService) {

    @GetMapping("/me")
    fun getMyLibrary(@RequestHeader("X-User-Id") userId: String): Mono<ResponseEntity<UserLibrary>> =
        libraryService.getLibrary(userId).map { ResponseEntity.ok(it) }

    @PostMapping("/liked-songs/{songId}")
    fun toggleLike(
        @RequestHeader("X-User-Id") userId: String,
        @PathVariable("songId") songId: String,
    ): Mono<ResponseEntity<UserLibrary>> =
        libraryService.toggleLikedSong(userId, songId).map { ResponseEntity.ok(it) }

    @PostMapping("/saved-albums/{albumId}")
    fun toggleSave(
        @RequestHeader("X-User-Id") userId: String,
        @PathVariable("albumId") albumId: String
    ): Mono<ResponseEntity<UserLibrary>> =
        libraryService.toggleSavedAlbums(userId, albumId).map { ResponseEntity.ok(it) }


}