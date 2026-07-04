package com.alex.catalogservice.services

import com.alex.catalogservice.dtos.SearchResultDto
import com.alex.catalogservice.models.Album
import com.alex.catalogservice.models.Song
import com.alex.catalogservice.repositories.AlbumRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class CatalogService(
    private val albumRepository: AlbumRepository,
) {
    fun search(query: String): Mono<SearchResultDto> {
        val albumSearch = albumRepository.findByTitleContainingIgnoreCase(query)
            .collectList()

        val songSearch = albumRepository.findAll()
            .flatMap { album ->
                Flux.fromIterable(
                    album.songs.filter { it.title.contains(query, true) }
                )
            }
            .collectList()

        return Mono.zip(albumSearch, songSearch) { albums, songs ->
            SearchResultDto(songs = songs, albums = albums)
        }
    }

    fun getAlbums(genre: String?, page: Int, size: Int): Flux<Album> {
        val all = if (genre != null) {
            albumRepository.findByGenreIgnoreCaseOrderByReleaseDateDesc(genre)
        } else {
            albumRepository.findAllByOrderByReleaseDateDesc()
        }
        return all.skip(page * size.toLong()).take(size.toLong())
    }

    fun getAlbumsByGenre(genre: String): Flux<Album> =
        albumRepository.findByGenreIgnoreCase(genre)

    fun getAlbumsByArtistId(artistId: String): Flux<Album> = albumRepository.findByArtistId(artistId)

    fun getAlbumById(albumId: String): Mono<Album> = albumRepository.findById(albumId)

    fun createAlbum(album: Album): Mono<Album> = albumRepository.save(album)

    fun addSongToAlbum(albumId: String, artistId: String, song: Song): Mono<Album> =
         albumRepository.findById(albumId)
            .flatMap { album ->
                if (album.artistId != artistId) {
                    Mono.error(ResponseStatusException(HttpStatus.FORBIDDEN, "Not your album!"))
                } else {
                    albumRepository.save(album.copy(songs = album.songs + song))

                }
            }

    fun getSongById(songId: String): Mono<Song> = albumRepository.findBySongId(songId)
        .mapNotNull { album -> album.songs.find { it.songId == songId } }


}