package com.alex.streaming_service.controllers

import com.alex.streaming_service.DTOs.PlayEventRequest
import com.alex.streaming_service.services.JwtService
import com.alex.streaming_service.services.KafkaService
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
@CrossOrigin(origins = ["*"])
class AnalyticsController(
    private val jwtService: JwtService,
    private val kafkaService: KafkaService
) {
    @PostMapping("/play-event")
    fun recordPlayEvent(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: PlayEventRequest
    ): Mono<ResponseEntity<Void>> {
        if(request.listenDurationSeconds < 30) {
            return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).build())
        }

        val token = authHeader.removePrefix("Bearer ").trim()
        if(!jwtService.isValid((token))) {
            return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build())
        }

        val userId = jwtService.extractUserId(token)

        return kafkaService.sendPlayEvent(userId, request.songId)
            .then(Mono.just(ResponseEntity.accepted().build()))
    }
}