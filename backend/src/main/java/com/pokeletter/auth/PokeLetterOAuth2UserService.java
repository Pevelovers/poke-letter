package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import java.util.Locale;
import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/** 카카오·네이버 로그인: 제공자 고유 ID만 꺼내 계정과 연결한다. 다른 속성은 저장하지 않는다. */
@Service
public class PokeLetterOAuth2UserService extends DefaultOAuth2UserService {

	private final LoginUserRegistrar registrar;

	PokeLetterOAuth2UserService(LoginUserRegistrar registrar) {
		this.registrar = registrar;
	}

	@Override
	public OAuth2User loadUser(OAuth2UserRequest request) {
		OAuth2User user = super.loadUser(request);
		Provider provider = Provider.valueOf(
				request.getClientRegistration().getRegistrationId().toUpperCase(Locale.ROOT));
		String providerUserId = providerUserId(provider, user.getAttributes());
		Long userId = registrar.findOrCreate(provider, providerUserId).getId();
		return new OAuth2LoginUser(userId, provider);
	}

	static String providerUserId(Provider provider, Map<String, Object> attributes) {
		Object id = switch (provider) {
			// 카카오: {"id": 1234567890, ...}
			case KAKAO -> attributes.get("id");
			// 네이버: {"resultcode": "00", "response": {"id": "abc..."}}
			case NAVER -> attributes.get("response") instanceof Map<?, ?> response ? response.get("id") : null;
			case GOOGLE -> null;
		};
		if (id == null || id.toString().isBlank()) {
			throw new OAuth2AuthenticationException(new OAuth2Error("invalid_user_info"),
					provider + " 응답에 사용자 고유 ID가 없습니다");
		}
		return id.toString();
	}

}
