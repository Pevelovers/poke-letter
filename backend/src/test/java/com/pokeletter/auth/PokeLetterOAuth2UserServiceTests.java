package com.pokeletter.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pokeletter.user.Provider;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

class PokeLetterOAuth2UserServiceTests {

	@Test
	void 카카오는_최상위_id를_고유_ID로_쓴다() {
		assertThat(PokeLetterOAuth2UserService.providerUserId(Provider.KAKAO, Map.of("id", 1234567890L)))
			.isEqualTo("1234567890");
	}

	@Test
	void 네이버는_response_안의_id를_고유_ID로_쓴다() {
		Map<String, Object> attributes = Map.of("resultcode", "00", "response", Map.of("id", "abcDEF123"));

		assertThat(PokeLetterOAuth2UserService.providerUserId(Provider.NAVER, attributes)).isEqualTo("abcDEF123");
	}

	@Test
	void 고유_ID가_없으면_로그인을_실패시킨다() {
		assertThatThrownBy(() -> PokeLetterOAuth2UserService.providerUserId(Provider.KAKAO, Map.of()))
			.isInstanceOf(OAuth2AuthenticationException.class);
	}

}
