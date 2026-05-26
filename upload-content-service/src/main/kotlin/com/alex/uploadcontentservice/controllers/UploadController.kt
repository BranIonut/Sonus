package com.alex.uploadcontentservice.controllers

import com.alex.uploadcontentservice.dtos.ConfirmUploadRequest
import com.alex.uploadcontentservice.dtos.CoverUploadResponse
import com.alex.uploadcontentservice.dtos.InitUploadRequest
import com.alex.uploadcontentservice.dtos.InitUploadResponse
import com.alex.uploadcontentservice.models.SongMetadata
import com.alex.uploadcontentservice.services.UploadService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.multipart.FilePart
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/upload")
@Tag(name = "Upload Content API", description = "Endpoints for artists to upload new songs")

class UploadController(
    private val uploadService: UploadService
) {

    @PostMapping("/init")
    @Operation(summary = "Get a presigned MinIO URL to upload the audio file")
    fun initUpload(
        @RequestHeader("X-User-Id") artistId: String,
        @RequestBody request: InitUploadRequest
    ): Mono<ResponseEntity<InitUploadResponse>> {
        return uploadService.initUpload(artistId, request.albumId, request.extension)
            .map { ResponseEntity.status(HttpStatus.CREATED).body(it) }
    }

    @PatchMapping("/confirm")
    @Operation(summary = "Confirm upload completed and set song metadata")
    fun confirmUpload(
        @RequestHeader("X-User-Id") artistId: String,
        @RequestBody request: ConfirmUploadRequest
    ): Mono<ResponseEntity<SongMetadata>> {
        return uploadService.confirmUpload(request, artistId)
            .map { ResponseEntity.ok(it) }
            .onErrorResume(SecurityException::class.java) {
                Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
            }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build())
    }

    @PostMapping("/cover/{albumId}")
    @Operation(summary = "Get a presigned MinIO URL to upload an album cover")
    fun initCoverUpload(
        @RequestHeader("X-User-Id") artistId: String,
        @PathVariable albumId: String,
    ): Mono<ResponseEntity<CoverUploadResponse>> {
        return uploadService.initCoverUpload(artistId, albumId)
            .map { ResponseEntity.ok(it) }
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.FORBIDDEN).build())
    }


}