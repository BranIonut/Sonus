package com.alex.artist_service.repositories

import com.alex.artist_service.models.ArtistProfile
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface ArtistProfileRepository: ReactiveMongoRepository<ArtistProfile, String> {

}