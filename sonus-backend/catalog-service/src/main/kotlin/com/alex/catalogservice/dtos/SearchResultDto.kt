package com.alex.catalogservice.dtos

import com.alex.catalogservice.models.Album
import com.alex.catalogservice.models.Song

data class SearchResultDto(
    val songs: List<Song> = emptyList(),
    val albums: List<Album> = emptyList(),
)
