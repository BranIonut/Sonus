package com.alex

import org.springframework.boot.WebApplicationType
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class UserAuthServiceApplication

fun main(args: Array<String>) {
	runApplication<UserAuthServiceApplication>(*args)
}
