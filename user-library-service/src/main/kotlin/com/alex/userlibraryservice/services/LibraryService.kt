package com.alex.userlibraryservice.services

import com.alex.userlibraryservice.models.Playlist
import com.alex.userlibraryservice.models.UserLibrary
import com.alex.userlibraryservice.repositories.PlaylistRepository
import com.alex.userlibraryservice.repositories.UserLibraryRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class LibraryService(
    val userLibraryRepository: UserLibraryRepository,
    val playlistRepository: PlaylistRepository
) {

    private fun getOrCreateLibrary(userId: String): Mono<UserLibrary> =
        userLibraryRepository.findById(userId)
            .switchIfEmpty(userLibraryRepository.save(UserLibrary(userId = userId)))

    fun getLibrary(userId: String): Mono<UserLibrary> = getOrCreateLibrary(userId)

    fun toggleLikedSong(userId: String, songId: String): Mono<UserLibrary> =
        getOrCreateLibrary(userId).flatMap { library ->
            val updatedSongs = if (library.likedSongs.contains(songId)) {
                library.likedSongs - songId
            } else {
                library.likedSongs + songId
            }
            userLibraryRepository.save(library.copy(likedSongs = updatedSongs))
        }

    fun toggleSavedAlbums(userId: String, albumId: String): Mono<UserLibrary> =
        getOrCreateLibrary(userId).flatMap { library ->
            val updatedAlbums = if (library.savedAlbums.contains(albumId)) {
                library.savedAlbums - albumId
            } else {
                library.savedAlbums + albumId
            }
            userLibraryRepository.save(library.copy(savedAlbums = updatedAlbums))
        }

    fun getUserPlaylists(userId: String): Flux<Playlist> =
        playlistRepository.findByUserId(userId)

    fun createPlaylist(userId: String, title: String, description: String?): Mono<Playlist> {
        val playlist = Playlist(userId = userId, title = title, description = description)
        return playlistRepository.save(playlist)
    }

    fun addSongToPlaylist(userId: String, playlistId: String, songId: String): Mono<Playlist> =
        playlistRepository.findById(playlistId)
            .flatMap { playlist ->
                if (playlist.userId != userId) {
                    Mono.error(ResponseStatusException(HttpStatus.FORBIDDEN, "Not your playlist!"))
                } else {
                    playlistRepository.save(playlist.copy(songs = playlist.songs + songId))
                }
            }

    fun removeSongFromPlaylist(userId: String, playlistId: String, songId: String): Mono<Playlist> =
        playlistRepository.findById(playlistId)
            .flatMap { playlist ->
                if (playlist.userId != userId) {
                    Mono.error(ResponseStatusException(HttpStatus.FORBIDDEN, "Not your playlist"))
                } else {
                    playlistRepository.save(playlist.copy(songs = playlist.songs - songId))
                }
            }

}