package com.alex.streaming_service.controllers

import com.alex.streaming_service.DTOs.PlayEventRequest
import com.alex.streaming_service.services.KafkaService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping(value = ["/api/analytics"])
@Tag(name="Analytics", description="Endpoints for registering streaming events")
class AnalyticsController(
    private val kafkaService: KafkaService
) {
    @Operation(summary = "Record a play event")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Play event"),
        ApiResponse(responseCode = "400", description = "Bad request"),
        ApiResponse(responseCode = "403", description = "Forbidden (user id mismatch)")
    )
    @PostMapping("/play-event")
    fun recordPlayEvent(
        @RequestHeader("X-User-Id") authenticatedUserId: String,
        @RequestBody request: PlayEventRequest
    ): Mono<ResponseEntity<Void>> {
        if(request.listenDurationSeconds < 30) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build())
        }

        if(request.userId != authenticatedUserId) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }

        return kafkaService.sendPlayEvent(request.userId, request.songId)
            .then(Mono.just(ResponseEntity.accepted().build()))
    }
}