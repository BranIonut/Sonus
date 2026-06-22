package com.alex.artist_service.services

import com.alex.artist_service.models.ArtistProfile
import com.alex.artist_service.repositories.ArtistProfileRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ArtistService(private val artistProfileRepository: ArtistProfileRepository) {

    fun getArtistProfile(artistId: String): Mono<ArtistProfile> =
        artistProfileRepository.findByUserId(artistId)

    fun getAllArtists(): Flux<ArtistProfile> =
        artistProfileRepository.findAll()

    fun searchArtists(query: String): Flux<ArtistProfile> =
        artistProfileRepository.findByStageNameContainingIgnoreCase(query)


    fun updateArtistProfile(artistProfile: ArtistProfile): Mono<ArtistProfile> =
         artistProfileRepository.save(artistProfile)


    fun deleteArtist(artistId: String): Mono<Void> =
        artistProfileRepository.deleteById(artistId)

}