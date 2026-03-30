package com.alex.analytics_service.models

import org.springframework.data.annotation.Id
import org.springframework.data.elasticsearch.annotations.Document
import org.springframework.data.elasticsearch.annotations.Field
import org.springframework.data.elasticsearch.annotations.FieldType
import java.time.Instant

@Document(indexName = "user-play-history")
data class PlayEventDocument (
    @Id
    val id: String? = null,

    @Field(type=FieldType.Keyword)
    val userId: String,

    @Field(type= FieldType.Keyword)
    val songId: String,

    @Field(type = FieldType.Date)
    val timestamp: Instant = Instant.now()
)