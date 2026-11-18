package com.pokeletter.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.pokeletter.TestcontainersConfiguration;
import com.pokeletter.ball.Ball;
import com.pokeletter.ball.BallRepository;
import com.pokeletter.character.PackCharacter;
import com.pokeletter.character.PackCharacterRepository;
import com.pokeletter.seed.PokeApiModels.Item;
import com.pokeletter.seed.PokeApiModels.ItemCategory;
import com.pokeletter.seed.PokeApiModels.ItemPocket;
import com.pokeletter.seed.PokeApiModels.ItemSprites;
import com.pokeletter.seed.PokeApiModels.LocalizedName;
import com.pokeletter.seed.PokeApiModels.NamedResource;
import com.pokeletter.seed.PokeApiModels.Pokemon;
import com.pokeletter.seed.PokeApiModels.PokemonForm;
import com.pokeletter.seed.PokeApiModels.PokemonType;
import com.pokeletter.seed.PokeApiModels.ResourceList;
import com.pokeletter.seed.PokeApiModels.Species;
import com.pokeletter.seed.PokeApiModels.Sprites;
import com.pokeletter.seed.PokeApiModels.Variety;
import com.pokeletter.seed.PokeApiModels.VersionGroup;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.transaction.annotation.Transactional;

/** PokéAPI 대신 가짜 응답으로 시드 규칙을 확인한다. 네트워크를 쓰지 않는다. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class SeedTests {

	@Autowired
	PackCharacterRepository characterRepository;

	@Autowired
	BallRepository ballRepository;

	FakePokeApi api;

	@BeforeEach
	void setUp() {
		api = new FakePokeApi();
		api.versionGroup("sun-moon", "generation-vii");
		api.versionGroup("sword-shield", "generation-viii");
		api.versionGroup("scarlet-violet", "generation-ix");

		api.species(25, "pikachu", "피카츄", "generation-i",
				pokemon("pikachu", true, null, "electric"),
				pokemon("pikachu-alola-cap", false, null, "electric"),
				pokemon("pikachu-gmax", false, null, "electric"));
		api.species(26, "raichu", "라이츄", "generation-i",
				pokemon("raichu", true, null, "electric"),
				pokemon("raichu-alola", false, "sun-moon", "electric", "psychic"),
				pokemon("raichu-mega-x", false, null, "electric"));
		api.species(128, "tauros", "켄타로스", "generation-i",
				pokemon("tauros", true, null, "normal"),
				pokemon("tauros-paldea-combat-breed", false, "scarlet-violet", "fighting"),
				pokemon("tauros-paldea-blaze-breed", false, "scarlet-violet", "fighting", "fire"),
				pokemon("tauros-paldea-aqua-breed", false, "scarlet-violet", "fighting", "water"));
		api.species(555, "darmanitan", "불비달마", "generation-v",
				pokemon("darmanitan-standard", true, null, "fire"),
				pokemon("darmanitan-zen", false, null, "fire", "psychic"),
				pokemon("darmanitan-galar-standard", false, "sword-shield", "ice"),
				pokemon("darmanitan-galar-zen", false, "sword-shield", "ice", "fire"));

		api.balls(
				ball(4, "poke-ball", "몬스터볼"),
				ball(3, "great-ball", "슈퍼볼"),
				ball(1785, "lapoke-ball", "몬스터볼"),
				ball(1786, "lagreat-ball", "슈퍼볼"),
				ball(1784, "lastrange-ball", "스트레인지볼"));
	}

	@Test
	void 기본_폼과_리전폼만_넣고_나머지_폼은_뺀다() {
		new CharacterSeeder(api, characterRepository).seed();

		assertThat(characterRepository.findAll())
			.extracting(PackCharacter::getId, PackCharacter::getForm)
			.containsExactlyInAnyOrder(
					tuple(2500, "base"),
					tuple(2600, "base"), tuple(2601, "alola"),
					tuple(12800, "base"), tuple(12805, "paldea-combat"), tuple(12806, "paldea-blaze"),
					tuple(12807, "paldea-aqua"),
					tuple(55500, "base"), tuple(55502, "galar"));
	}

	@Test
	void 리전폼의_화면_이름은_원래_이름_그대로다() {
		new CharacterSeeder(api, characterRepository).seed();

		assertThat(characterRepository.findById(2601)).get().extracting(PackCharacter::getNameKo).isEqualTo("라이츄");
		assertThat(characterRepository.findAll())
			.filteredOn(character -> character.getDexNo() == 128)
			.extracting(PackCharacter::getNameKo)
			.containsOnly("켄타로스");
	}

	@Test
	void 세대는_폼이_처음_나온_세대다() {
		new CharacterSeeder(api, characterRepository).seed();

		assertThat(characterRepository.findById(2600)).get().extracting(PackCharacter::getGeneration)
			.isEqualTo((short) 1);
		assertThat(characterRepository.findById(2601)).get().extracting(PackCharacter::getGeneration)
			.isEqualTo((short) 7);
		assertThat(characterRepository.findById(55502)).get().extracting(PackCharacter::getGeneration)
			.isEqualTo((short) 8);
	}

	@Test
	void 타입은_폼마다_슬롯_순서로_넣는다() {
		new CharacterSeeder(api, characterRepository).seed();

		PackCharacter alolanRaichu = characterRepository.findById(2601).orElseThrow();
		assertThat(alolanRaichu.getType1()).isEqualTo("electric");
		assertThat(alolanRaichu.getType2()).isEqualTo("psychic");
		assertThat(characterRepository.findById(2500).orElseThrow().getType2()).isNull();
	}

	@Test
	void 다시_실행해도_같은_결과다() {
		new CharacterSeeder(api, characterRepository).seed();
		new BallSeeder(api, ballRepository).seed();
		long characters = characterRepository.count();
		long balls = ballRepository.count();

		new CharacterSeeder(api, characterRepository).seed();
		new BallSeeder(api, ballRepository).seed();

		assertThat(characterRepository.count()).isEqualTo(characters);
		assertThat(ballRepository.count()).isEqualTo(balls);
	}

	@Test
	void 일반_볼과_이름이_겹치는_히스이_볼만_괄호를_붙인다() {
		new BallSeeder(api, ballRepository).seed();

		assertThat(ballRepository.findAll())
			.extracting(Ball::getItemKey, Ball::getNameKo)
			.containsExactlyInAnyOrder(
					tuple("poke-ball", "몬스터볼"),
					tuple("great-ball", "슈퍼볼"),
					tuple("lapoke-ball", "몬스터볼(히스이)"),
					tuple("lagreat-ball", "슈퍼볼(히스이)"),
					tuple("lastrange-ball", "스트레인지볼"));
	}

	@Test
	void 볼_id는_PokeAPI_아이템_id다() {
		new BallSeeder(api, ballRepository).seed();

		assertThat(ballRepository.findById(4)).get().extracting(Ball::getItemKey).isEqualTo("poke-ball");
	}

	// ---- 가짜 PokéAPI ----

	record FakePokemon(String name, boolean isDefault, String versionGroup, String[] types) {
	}

	static FakePokemon pokemon(String name, boolean isDefault, String versionGroup, String... types) {
		return new FakePokemon(name, isDefault, versionGroup, types);
	}

	static Item ball(int id, String key, String nameKo) {
		return new Item(id, key, List.of(new LocalizedName(nameKo, new NamedResource("ko", null))),
				new ItemSprites("https://example.com/items/" + key + ".png"));
	}

	static final class FakePokeApi implements PokeApi {

		private final Map<String, Object> responses = new HashMap<>();

		private final List<NamedResource> species = new ArrayList<>();

		FakePokeApi() {
			responses.put("pokemon-species?limit=2000", new ResourceList(species));
		}

		void versionGroup(String name, String generation) {
			responses.put(url("version-group", name), new VersionGroup(new NamedResource(generation, null)));
		}

		void species(int dexNo, String name, String nameKo, String generation, FakePokemon... varieties) {
			String speciesUrl = url("pokemon-species", name);
			species.add(new NamedResource(name, speciesUrl));
			List<Variety> varietyList = new ArrayList<>();
			for (FakePokemon fake : varieties) {
				String pokemonUrl = url("pokemon", fake.name());
				String formUrl = url("pokemon-form", fake.name());
				varietyList.add(new Variety(fake.isDefault(), new NamedResource(fake.name(), pokemonUrl)));
				List<PokemonType> types = new ArrayList<>();
				for (int slot = 0; slot < fake.types().length; slot++) {
					types.add(new PokemonType(slot + 1, new NamedResource(fake.types()[slot], null)));
				}
				responses.put(pokemonUrl, new Pokemon(dexNo, fake.name(), types,
						new Sprites("https://example.com/" + fake.name() + ".png"),
						List.of(new NamedResource(fake.name(), formUrl))));
				if (fake.versionGroup() != null) {
					responses.put(formUrl,
							new PokemonForm(new NamedResource(fake.versionGroup(), url("version-group", fake.versionGroup()))));
				}
			}
			responses.put(speciesUrl, new Species(dexNo, name,
					List.of(new LocalizedName(nameKo, new NamedResource("ko", null)),
							new LocalizedName(name, new NamedResource("en", null))),
					new NamedResource(generation, null), varietyList));
		}

		void balls(Item... items) {
			String categoryUrl = url("item-category", "all-balls");
			List<NamedResource> itemResources = new ArrayList<>();
			for (Item item : items) {
				String itemUrl = url("item", item.name());
				itemResources.add(new NamedResource(item.name(), itemUrl));
				responses.put(itemUrl, item);
			}
			responses.put(categoryUrl, new ItemCategory(itemResources));
			responses.put("item-pocket/pokeballs",
					new ItemPocket(List.of(new NamedResource("all-balls", categoryUrl))));
		}

		@Override
		public <T> T get(String pathOrUrl, Class<T> type) {
			Object response = responses.get(pathOrUrl);
			if (response == null) {
				throw new IllegalStateException("가짜 응답이 없습니다: " + pathOrUrl);
			}
			return type.cast(response);
		}

		private static String url(String resource, String name) {
			return "https://pokeapi.test/api/v2/" + resource + "/" + name + "/";
		}

	}

}
