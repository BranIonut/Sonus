package com.alex.artist_service.controllers

import com.alex.artist_service.repositories.ArtistProfileRepository
import com.alex.artist_service.services.JwtService
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/artists")
@CrossOrigin(origins = ["*"])
class ArtistController(
    private val repository: ArtistProfileRepository,
    private val jwtService: JwtService
) {

}