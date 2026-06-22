package com.alex.userlibraryservice.repositories

import com.alex.userlibraryservice.models.UserLibrary
import org.springframework.data.mongodb.repository.ReactiveMongoRepository
import org.springframework.stereotype.Repository

@Repository
interface UserLibraryRepository: ReactiveMongoRepository<UserLibrary, String>