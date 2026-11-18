package com.pokeletter.seed;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 선택 가능한 폼인지 판단하고 폼 코드와 번호를 정한다 (POL-CHR-01).
 *
 * <p>기본 폼과 리전폼(알로라, 가라르, 히스이, 팔데아)만 받는다. 메가진화, 거다이맥스, 모자 쓴 피카츄, 달마모드
 * 같은 나머지 폼은 제외한다. 이로치는 폼이 아니라 이미지라 여기서 다루지 않는다.
 */
final class RegionalForm {

	static final String BASE = "base";

	/** 캐릭터 id = 도감 번호 × 100 + 폼 번호. 한 번 정한 번호는 바꾸지 않는다. */
	private static final Map<String, Integer> FORM_NUMBERS = Map.of(
			BASE, 0,
			"alola", 1,
			"galar", 2,
			"hisui", 3,
			"paldea", 4,
			"paldea-combat", 5,
			"paldea-blaze", 6,
			"paldea-aqua", 7);

	private RegionalForm() {
	}

	/**
	 * @param speciesName PokéAPI 종 이름 (예: {@code raichu})
	 * @param pokemonName PokéAPI 포켓몬 이름 (예: {@code raichu-alola})
	 * @param isDefault 그 종의 기본 모습인지
	 * @return 선택 가능하면 폼 코드 ({@code base}, {@code alola}, {@code paldea-combat} 등)
	 */
	static Optional<String> formCode(String speciesName, String pokemonName, boolean isDefault) {
		if (isDefault) {
			return Optional.of(BASE);
		}
		// 예: raichu-alola, darmanitan-galar-standard, tauros-paldea-combat-breed
		Pattern pattern = Pattern.compile("^" + Pattern.quote(speciesName)
				+ "-(alola|galar|hisui|paldea)(?:-(combat|blaze|aqua)-breed)?(?:-standard)?$");
		Matcher matcher = pattern.matcher(pokemonName);
		if (!matcher.matches()) {
			return Optional.empty();
		}
		String breed = matcher.group(2);
		return Optional.of(breed == null ? matcher.group(1) : matcher.group(1) + "-" + breed);
	}

	static int characterId(int dexNo, String formCode) {
		Integer formNumber = FORM_NUMBERS.get(formCode);
		if (formNumber == null) {
			throw new IllegalArgumentException("번호가 정해지지 않은 폼입니다: " + formCode);
		}
		return dexNo * 100 + formNumber;
	}

}
