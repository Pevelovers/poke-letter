package com.pokeletter;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.mysql.MySQLContainer;
import org.testcontainers.utility.DockerImageName;

@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	MySQLContainer mysqlContainer() {
		// 로컬 compose와 같은 버전. 운영은 8.0.16 이상이면 된다
		return new MySQLContainer(DockerImageName.parse("mysql:8.4"))
			.withCommand("--character-set-server=utf8mb4", "--collation-server=utf8mb4_0900_ai_ci",
					"--default-time-zone=+00:00");
	}

}
