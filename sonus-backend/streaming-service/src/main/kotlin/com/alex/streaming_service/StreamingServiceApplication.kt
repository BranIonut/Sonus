package com.alex.streaming_service

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class StreamingServiceApplication

fun main(args: Array<String>) {
	runApplication<StreamingServiceApplication>(*args)
}
