package com.alex.streaming_service.services

import com.alex.streaming_service.repositories.AudioRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.buffer.DataBuffer
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class AudioService {

    @Autowired
    private lateinit var audioRepository: AudioRepository

    fun getAudioSize(songId: String): Mono<Long> {
        return audioRepository.getAudioMetadata(songId)
    }

    fun streamAudioFile(songId: String, start: Long, length: Long): Flux<DataBuffer> {

        return audioRepository.getAudioFile(songId, start, length)
    }
}