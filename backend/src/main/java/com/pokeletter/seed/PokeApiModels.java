package com.pokeletter.seed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** 시드에 필요한 PokéAPI 응답 필드만 담는다. 나머지 필드는 무시한다. */
final class PokeApiModels {

	private PokeApiModels() {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record NamedResource(String name, String url) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record ResourceList(List<NamedResource> results) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record LocalizedName(String name, NamedResource language) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Variety(@JsonProperty("is_default") boolean isDefault, NamedResource pokemon) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Species(int id, String name, List<LocalizedName> names, NamedResource generation,
			List<Variety> varieties) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record PokemonType(int slot, NamedResource type) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Sprites(@JsonProperty("front_default") String frontDefault) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Pokemon(int id, String name, List<PokemonType> types, Sprites sprites, List<NamedResource> forms) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record PokemonForm(@JsonProperty("version_group") NamedResource versionGroup) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record VersionGroup(NamedResource generation) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record ItemPocket(List<NamedResource> categories) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record ItemCategory(List<NamedResource> items) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record ItemSprites(@JsonProperty("default") String defaultSprite) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	record Item(int id, String name, List<LocalizedName> names, ItemSprites sprites) {
	}

}
