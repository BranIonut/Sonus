package com.alex.artist_service

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ArtistServiceApplication

fun main(args: Array<String>) {
    runApplication<ArtistServiceApplication>(*args)
}
