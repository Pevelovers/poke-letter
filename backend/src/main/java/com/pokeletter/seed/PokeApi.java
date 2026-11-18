package com.pokeletter.seed;

/**
 * PokéAPI 조회. 시드할 때만 쓰며, 서비스 실행 중에는 호출하지 않는다 (POL-IP-04).
 *
 * <p>테스트에서 네트워크 없이 바꿔 끼울 수 있도록 인터페이스로 둔다.
 */
interface PokeApi {

	/** 상대 경로(예: {@code pokemon-species?limit=2000}) 또는 PokéAPI가 돌려준 전체 URL을 조회한다. */
	<T> T get(String pathOrUrl, Class<T> type);

}
