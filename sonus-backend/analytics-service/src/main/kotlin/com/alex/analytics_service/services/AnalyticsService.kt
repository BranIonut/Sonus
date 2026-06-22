package com.alex.analytics_service.services

import com.alex.analytics_service.dtos.ArtistStatsDto
import com.alex.analytics_service.dtos.PlayHistoryEntry
import com.alex.analytics_service.dtos.RankedEntry
import com.alex.analytics_service.dtos.SongStatsDto
import com.alex.analytics_service.dtos.UserStatsDto
import com.alex.analytics_service.repositories.PlayEventRepository
import org.springframework.boot.data.autoconfigure.web.DataWebProperties
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.ReactiveMongoTemplate
import org.springframework.data.mongodb.core.aggregation.Aggregation.group
import org.springframework.data.mongodb.core.aggregation.Aggregation.limit
import org.springframework.data.mongodb.core.aggregation.Aggregation.match
import org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation
import org.springframework.data.mongodb.core.aggregation.Aggregation.sort
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class AnalyticsService(
    private val playEventRepository: PlayEventRepository,
    private val mongoTemplate: ReactiveMongoTemplate
) {

    fun getUserHistory(userId: String, limit: Int): Flux<PlayHistoryEntry> =
        playEventRepository.findByUserIdOrderByTimestampDesc(userId)
            .take(limit.toLong())
            .map { PlayHistoryEntry(it.songId, it.artistId, it.timestamp) }

    fun getUserStats(userId: String, topN: Int): Mono<UserStatsDto> {
        val totalPlays = playEventRepository.countByUserId(userId)

        val uniqueSongs = playEventRepository.findByUserIdOrderByTimestampDesc(userId)
            .map { it.songId }.distinct().count()

        val uniqueArtists = playEventRepository.findByUserIdOrderByTimestampDesc(userId)
            .map { it.artistId }.distinct().count()

        val topSongs = getTopSongsForUser(userId, topN).collectList()
        val topArtists = getTopArtistsForUser(userId, topN).collectList()

        return Mono.zip(totalPlays, uniqueSongs, uniqueArtists, topSongs, topArtists)
            .map { tuple ->
                UserStatsDto(
                    userId = userId,
                    totalPlays = tuple.t1,
                    uniqueSongs = tuple.t2,
                    uniqueArtists = tuple.t3,
                    topSongs = tuple.t4,
                    topArtists = tuple.t5
                )
            }

    }

    fun getTopSongsForUser(userId: String, limit: Int): Flux<RankedEntry> {
        val aggregation = newAggregation(
            match(Criteria.where("userId").`is`(userId)),
            group("songId").count().`as`("playCount"),
            sort(Sort.Direction.DESC, "playCount"),
            limit(limit.toLong())
        )

        return mongoTemplate.aggregate(aggregation, "play_events", Map::class.java)
            .map { RankedEntry(id = it["_id"].toString(), playCount = (it["playCount"] as Int).toLong()) }
    }

    fun getTopArtistsForUser(userId: String, limit: Int): Flux<RankedEntry> {
        val aggregation = newAggregation(
            match(Criteria.where("artistId").`is`(userId)),
            group("artistId").count().`as`("playCount"),
            sort(Sort.Direction.DESC, "playCount"),
            limit(limit.toLong())
        )

        return mongoTemplate.aggregate(aggregation, "play_events", Map::class.java)
            .map { RankedEntry(id = it["_id"].toString(), playCount = (it["playCount"] as Int).toLong()) }
    }

    fun getGlobalTopSongs(limit: Int): Flux<RankedEntry> {
        val aggregation = newAggregation(
            group("songId").count().`as`("playCount"),
            sort(Sort.Direction.DESC, "playCount"),
            limit(limit.toLong())
        )

        return mongoTemplate
            .aggregate(aggregation, "play_events", Map::class.java)
            .map { RankedEntry(id = it["_id"].toString(), playCount = (it["playCount"] as Int).toLong()) }
    }

    fun getGlobalTopArtists(limit: Int): Flux<RankedEntry> {
        val aggregation = newAggregation(
            group("artistId").count().`as`("playCount"),
            sort(Sort.Direction.DESC, "playCount"),
            limit(limit.toLong())
        )

        return mongoTemplate
            .aggregate(aggregation, "play_events", Map::class.java)
            .map { RankedEntry(id = it["_id"].toString(), playCount = (it["playCount"] as Int).toLong()) }
    }

    fun getSongStats(songId: String): Mono<SongStatsDto> =
        playEventRepository.countBySongId(songId)
            .map { SongStatsDto(songId = songId, totalPlays = it) }

    fun getArtistStats(artistId: String): Mono<ArtistStatsDto> {
        val totalPlays = playEventRepository.countByArtistId(artistId)

        val uniqueListeners = playEventRepository.findByArtistId(artistId)
            .map { it.userId }.distinct().count()

        return Mono.zip(totalPlays, uniqueListeners) { plays, listeners ->
            ArtistStatsDto(artistId = artistId, totalPlays = plays, uniqueListeners = listeners)
        }
    }

}