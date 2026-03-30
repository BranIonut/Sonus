package com.alex.streaming_service.controllers

import com.alex.streaming_service.services.AudioService
import com.alex.streaming_service.services.JwtService
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.http.HttpRange
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@CrossOrigin(origins = ["*"])
class AudioController(private val audioService: AudioService, private val jwtService: JwtService) {
    @GetMapping("/streaming")
    fun streamAudio(
        @RequestHeader(value = "Range", required = false) rangeHeader: String?,
        @RequestHeader(value = "Song-Id") songId: String,
        @RequestHeader(value = "Authorization") authorization: String,
    ): Mono<ResponseEntity<Flux<DataBuffer>>> {

        val token = authorization.removePrefix("Bearer ").trim()

        if(!jwtService.isValid(token) || !jwtService.hasActiveSubscription(token)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
        }

        return this.audioService.getAudioSize(songId).map { fileSize ->
            var start = 0L
            var end = fileSize - 1

            if (rangeHeader != null) {
                val ranges = HttpRange.parseRanges(rangeHeader)
                if (ranges.isNotEmpty()) {
                    start = ranges[0].getRangeStart(fileSize)
                    end = ranges[0].getRangeEnd(fileSize)
                }
            }

            val contentLength = fileSize - start + 1
            val audioFlux = audioService.streamAudioFile(songId, start, contentLength)

            ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .header("Content-Type", "audio/mp4")
                .header("Accept-Ranges", "bytes")
                .header("Content-Length", contentLength.toString())
                .header("Content-Range", "bytes $start-$end/$fileSize")
                .body(audioFlux)

        }.defaultIfEmpty(ResponseEntity.notFound().build())
    }


}