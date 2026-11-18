package com.pokeletter.seed;

import com.pokeletter.character.PackCharacter;
import com.pokeletter.character.PackCharacterRepository;
import com.pokeletter.seed.PokeApiModels.LocalizedName;
import com.pokeletter.seed.PokeApiModels.Pokemon;
import com.pokeletter.seed.PokeApiModels.PokemonForm;
import com.pokeletter.seed.PokeApiModels.PokemonType;
import com.pokeletter.seed.PokeApiModels.ResourceList;
import com.pokeletter.seed.PokeApiModels.Species;
import com.pokeletter.seed.PokeApiModels.Variety;
import com.pokeletter.seed.PokeApiModels.VersionGroup;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;

/**
 * PokéAPI에서 선택 가능한 포켓몬을 받아 {@code characters}에 넣는다 (POL-IP-04).
 *
 * <ul>
 * <li>기본 폼과 리전폼만 넣는다 (POL-CHR-01, {@link RegionalForm})
 * <li>화면 이름은 리전폼도 종의 한국어 이름 그대로다 (POL-CHR-06)
 * <li>세대는 폼이 처음 나온 세대다. 기본 폼은 종의 세대, 리전폼은 폼의 버전 그룹 세대 (POL-CHR-07)
 * <li>id는 규칙으로 정하므로 다시 실행해도 같은 행을 갱신한다. 기존 행은 지우지 않는다 (메시지가 참조)
 * </ul>
 */
@Slf4j
class CharacterSeeder {

	static final String PACK = "pokemon";

	private final PokeApi pokeApi;

	private final PackCharacterRepository repository;

	private final Map<String, Short> generationByVersionGroup = new HashMap<>();

	CharacterSeeder(PokeApi pokeApi, PackCharacterRepository repository) {
		this.pokeApi = pokeApi;
		this.repository = repository;
	}

	int seed() {
		ResourceList speciesList = pokeApi.get("pokemon-species?limit=2000", ResourceList.class);
		List<PackCharacter> characters = new ArrayList<>();
		int excludedForms = 0;
		for (var speciesResource : speciesList.results()) {
			Species species = pokeApi.get(speciesResource.url(), Species.class);
			String nameKo = koreanName(species.names()).orElseGet(() -> {
				log.warn("한국어 이름이 없어 영어 이름을 씁니다: {}", species.name());
				return species.name();
			});
			for (Variety variety : species.varieties()) {
				Optional<String> form = RegionalForm.formCode(species.name(), variety.pokemon().name(),
						variety.isDefault());
				if (form.isEmpty()) {
					excludedForms++;
					continue;
				}
				toCharacter(species, nameKo, variety, form.get()).ifPresent(characters::add);
			}
		}
		repository.saveAll(characters);
		log.info("포켓몬 {}종을 시드했습니다 (제외한 폼 {}개)", characters.size(), excludedForms);
		return characters.size();
	}

	private Optional<PackCharacter> toCharacter(Species species, String nameKo, Variety variety, String form) {
		Pokemon pokemon = pokeApi.get(variety.pokemon().url(), Pokemon.class);
		String image = pokemon.sprites() == null ? null : pokemon.sprites().frontDefault();
		if (image == null) {
			log.warn("기본 이미지가 없어 넣지 않습니다: {}", pokemon.name());
			return Optional.empty();
		}
		List<String> types = pokemon.types().stream()
			.sorted(Comparator.comparingInt(PokemonType::slot))
			.map(type -> type.type().name())
			.toList();
		short generation = RegionalForm.BASE.equals(form)
				? Generations.parse(species.generation().name())
				: formGeneration(pokemon);
		int id = RegionalForm.characterId(species.id(), form);
		return Optional.of(new PackCharacter(id, PACK, species.id(), form, nameKo, image, generation, types.get(0),
				types.size() > 1 ? types.get(1) : null, id));
	}

	private short formGeneration(Pokemon pokemon) {
		PokemonForm form = pokeApi.get(pokemon.forms().get(0).url(), PokemonForm.class);
		return generationByVersionGroup.computeIfAbsent(form.versionGroup().url(),
				url -> Generations.parse(pokeApi.get(url, VersionGroup.class).generation().name()));
	}

	static Optional<String> koreanName(List<LocalizedName> names) {
		return names.stream()
			.filter(name -> "ko".equals(name.language().name()))
			.map(LocalizedName::name)
			.findFirst();
	}

}
