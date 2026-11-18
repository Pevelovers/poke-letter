package com.pokeletter.seed;

import com.pokeletter.ball.BallRepository;
import com.pokeletter.character.PackCharacterRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * {@code seed} 프로필로 실행하면 PokéAPI에서 포켓몬과 볼을 받아 DB에 넣고 끝난다. 웹 서버는 뜨지 않는다.
 *
 * <pre>
 * # 로컬 (compose DB)
 * ./gradlew bootRun --args='--spring.profiles.active=seed'
 * # 배포 환경 (DB_URL 등 환경 변수 필요)
 * java -jar backend.jar --spring.profiles.active=seed
 * </pre>
 *
 * 다시 실행해도 같은 결과다 (idempotent).
 */
@Slf4j
@Component
@Profile("seed")
class SeedRunner implements ApplicationRunner {

	private final CharacterSeeder characterSeeder;

	private final BallSeeder ballSeeder;

	SeedRunner(PokeApi pokeApi, PackCharacterRepository characterRepository, BallRepository ballRepository) {
		this.characterSeeder = new CharacterSeeder(pokeApi, characterRepository);
		this.ballSeeder = new BallSeeder(pokeApi, ballRepository);
	}

	@Override
	public void run(ApplicationArguments args) {
		log.info("PokéAPI 시드를 시작합니다. 수천 건을 요청하므로 몇 분 걸립니다");
		int characters = characterSeeder.seed();
		int balls = ballSeeder.seed();
		log.info("시드 완료: 포켓몬 {}종, 볼 {}종", characters, balls);
	}

}
