package com.alex.analytics_service.controllers

import com.alex.analytics_service.models.PlayEventDocument
import com.alex.analytics_service.repositories.PlayEventRepository
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = ["*"])
class AnalyticsController(private val playEventRepository: PlayEventRepository) {

    @GetMapping("user/{userId}/history")
    fun getUserHistory(@PathVariable userId: String): Flux<PlayEventDocument> {
        return playEventRepository.findByUserId(userId)
    }
}