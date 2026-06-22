package com.alex.analytics_service.controllers

import com.alex.analytics_service.dtos.ArtistStatsDto
import com.alex.analytics_service.dtos.PlayHistoryEntry
import com.alex.analytics_service.dtos.RankedEntry
import com.alex.analytics_service.dtos.SongStatsDto
import com.alex.analytics_service.dtos.UserStatsDto
import com.alex.analytics_service.models.PlayEventDocument
import com.alex.analytics_service.repositories.PlayEventRepository
import com.alex.analytics_service.services.AnalyticsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = ["*"])
class AnalyticsController(private val analyticsService: AnalyticsService) {

    @GetMapping("users/{userId}/history")
    fun getUserHistory(
        @PathVariable userId: String,
        @RequestParam(defaultValue = "50") limit: Int
    ): Flux<PlayHistoryEntry> =
        analyticsService.getUserHistory(userId, limit)

    @GetMapping("/users/{userId}/stats")
    fun getUserStats(
        @PathVariable userId: String,
        @RequestParam(defaultValue = "5") topN: Int
    ): Mono<ResponseEntity<UserStatsDto>> =
        analyticsService.getUserStats(userId, topN)
            .map { ResponseEntity.ok(it) }

    @GetMapping("/users/{userId}/top-songs")
    fun getTopSongsForUser(
        @PathVariable userId: String,
        @RequestParam(defaultValue = "10") limit: Int,
    ): Flux<RankedEntry> =
        analyticsService.getTopSongsForUser(userId, limit)

    @GetMapping("/users/{userId}/top-artists")
    fun getTopArtistsForUser(
        @PathVariable userId: String,
        @RequestParam(defaultValue = "10") limit: Int,
    ): Flux<RankedEntry> =
        analyticsService.getTopArtistsForUser(userId, limit)

    @GetMapping("/songs/{songId}")
    fun getSongStats(
        @PathVariable songId: String
    ): Mono<ResponseEntity<SongStatsDto>> =
        analyticsService.getSongStats(songId)
            .map { ResponseEntity.ok(it) }

    @GetMapping("/artists/{artistId}")
    fun getArtistStats(
        @PathVariable artistId: String
    ): Mono<ResponseEntity<ArtistStatsDto>> =
        analyticsService.getArtistStats(artistId)
            .map { ResponseEntity.ok(it) }

}