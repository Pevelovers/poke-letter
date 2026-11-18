package com.pokeletter.seed;

import com.pokeletter.ball.Ball;
import com.pokeletter.ball.BallRepository;
import com.pokeletter.seed.PokeApiModels.Item;
import com.pokeletter.seed.PokeApiModels.ItemCategory;
import com.pokeletter.seed.PokeApiModels.ItemPocket;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

/**
 * PokéAPI의 볼 아이템 전체를 {@code balls}에 넣는다 (POL-CHR-10).
 *
 * <p>id는 PokéAPI 아이템 id라 다시 실행해도 같은 행을 갱신한다. 일반 볼과 한국어 이름이 겹치는 히스이 볼
 * ({@code la}로 시작)만 {@code 몬스터볼(히스이)}처럼 괄호를 붙인다.
 */
@Slf4j
class BallSeeder {

	static final String HISUI_SUFFIX = "(히스이)";

	private final PokeApi pokeApi;

	private final BallRepository repository;

	BallSeeder(PokeApi pokeApi, BallRepository repository) {
		this.pokeApi = pokeApi;
		this.repository = repository;
	}

	int seed() {
		List<Item> items = new ArrayList<>();
		ItemPocket pocket = pokeApi.get("item-pocket/pokeballs", ItemPocket.class);
		for (var categoryResource : pocket.categories()) {
			ItemCategory category = pokeApi.get(categoryResource.url(), ItemCategory.class);
			for (var itemResource : category.items()) {
				Item item = pokeApi.get(itemResource.url(), Item.class);
				if (item.sprites() == null || item.sprites().defaultSprite() == null) {
					log.warn("이미지가 없어 넣지 않습니다: {}", item.name());
					continue;
				}
				items.add(item);
			}
		}

		Set<String> regularNames = items.stream()
			.filter(item -> !isHisui(item))
			.map(BallSeeder::koreanName)
			.collect(Collectors.toSet());
		List<Ball> balls = items.stream().map(item -> {
			String name = koreanName(item);
			if (isHisui(item) && regularNames.contains(name)) {
				name = name + HISUI_SUFFIX;
			}
			return new Ball(item.id(), item.name(), name, item.sprites().defaultSprite(), item.id());
		}).toList();

		repository.saveAll(balls);
		log.info("볼 {}종을 시드했습니다", balls.size());
		return balls.size();
	}

	private static boolean isHisui(Item item) {
		return item.name().startsWith("la");
	}

	private static String koreanName(Item item) {
		return CharacterSeeder.koreanName(item.names()).orElseGet(() -> {
			log.warn("한국어 이름이 없어 영어 이름을 씁니다: {}", item.name());
			return item.name();
		});
	}

}
