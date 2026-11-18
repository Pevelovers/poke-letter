package com.pokeletter.seed;

import java.util.List;

/** PokéAPI 세대 이름({@code generation-vii})을 숫자로 바꾼다. */
final class Generations {

	private static final List<String> ROMAN = List.of("i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix");

	private Generations() {
	}

	static short parse(String generationName) {
		int index = ROMAN.indexOf(generationName.replaceFirst("^generation-", ""));
		if (index < 0) {
			throw new IllegalArgumentException("알 수 없는 세대입니다: " + generationName);
		}
		return (short) (index + 1);
	}

}
