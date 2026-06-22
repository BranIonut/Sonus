package com.alex.userlibraryservice

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class UserLibraryServiceApplication

fun main(args: Array<String>) {
    runApplication<UserLibraryServiceApplication>(*args)
}
