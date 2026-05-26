package com.alex.streaming_service.controllers

import com.alex.streaming_service.services.AudioService
import com.alex.streaming_service.services.KafkaService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
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
@Tag(name = "Audio Streaming", description = "Endpoints for delivering audio files")
class AudioController(private val audioService: AudioService) {

    @Operation(summary = "Stream audio in chunks")
    @ApiResponses(
        ApiResponse(responseCode = "206", description = "Audio chunk delivered successfully"),
        ApiResponse(responseCode = "403", description = "User does not have an active subscription"),
        ApiResponse(responseCode = "404", description = "Song not found")
    )
    @GetMapping("/streaming")
    fun streamAudio(
        @RequestHeader(value = "Range", required = false) rangeHeader: String?,
        @RequestHeader(value = "X-Object-Key") objectKey: String,
        @RequestHeader(value = "X-Has-Active-Sub", defaultValue = "false") hasActiveSubscription: Boolean
    ): Mono<ResponseEntity<Flux<DataBuffer>>> {

        if (!hasActiveSubscription)
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())

        return audioService.getAudioSize(objectKey)
            .map { fileSize ->
                var start = 0L
                var end = fileSize - 1

                if (rangeHeader != null) {
                    val ranges = HttpRange.parseRanges(rangeHeader)
                    if (ranges.isNotEmpty()) {
                        start = ranges[0].getRangeStart(fileSize)
                        end = ranges[0].getRangeEnd(fileSize)
                    }
                }

                val contentLength = end - start + 1
                val audioFlux = audioService.streamAudioFile(objectKey, start, contentLength)

                ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                    .header("Content-Type", "audio/mp4")
                    .header("Accept-Ranges", "bytes")
                    .header("Content-Length", contentLength.toString())
                    .header("Content-Range", "bytes $start-$end/$fileSize")
                    .body(audioFlux)
            }
            .onErrorResume(NoSuchElementException::class.java) {
                Mono.just(ResponseEntity.notFound().build())
            }
    }
}