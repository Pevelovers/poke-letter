package com.pokeletter.seed;

import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

/**
 * PokéAPI HTTP 조회. 이용 정책에 따라 요청 사이에 간격을 두고, 일시적 오류는 몇 번 다시 시도한다.
 *
 * <p>User-Agent에는 개인 정보를 넣지 않는다.
 */
@Slf4j
@Component
@Profile("seed")
class RestPokeApi implements PokeApi {

	private static final int MAX_ATTEMPTS = 3;

	private final RestClient client;

	private final Duration requestDelay;

	RestPokeApi(@Value("${pokeletter.seed.pokeapi-base-url:https://pokeapi.co/api/v2/}") String baseUrl,
			@Value("${pokeletter.seed.request-delay:50ms}") Duration requestDelay) {
		this.client = RestClient.builder()
			.baseUrl(baseUrl)
			.defaultHeader("User-Agent", "PokeLetter-seed/1.0 (non-commercial fan project)")
			.build();
		this.requestDelay = requestDelay;
	}

	@Override
	public <T> T get(String pathOrUrl, Class<T> type) {
		for (int attempt = 1;; attempt++) {
			pause(requestDelay.multipliedBy(attempt));
			try {
				return client.get().uri(pathOrUrl).retrieve().body(type);
			}
			catch (HttpServerErrorException | ResourceAccessException ex) {
				retryOrThrow(pathOrUrl, attempt, ex);
			}
			catch (HttpClientErrorException.TooManyRequests ex) {
				retryOrThrow(pathOrUrl, attempt, ex);
			}
		}
	}

	private static void retryOrThrow(String pathOrUrl, int attempt, RuntimeException ex) {
		if (attempt >= MAX_ATTEMPTS) {
			throw ex;
		}
		log.warn("PokéAPI 요청 실패, 다시 시도합니다 ({}/{}): {} - {}", attempt, MAX_ATTEMPTS, pathOrUrl, ex.getMessage());
	}

	private static void pause(Duration duration) {
		try {
			Thread.sleep(duration);
		}
		catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
			throw new IllegalStateException("시드가 중단되었습니다", ex);
		}
	}

}
