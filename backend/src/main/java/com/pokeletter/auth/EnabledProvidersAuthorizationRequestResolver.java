package com.pokeletter.auth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.function.Supplier;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

/**
 * 꺼진 제공자로는 로그인을 시작하지 않는다 (POL-ACC-02).
 *
 * <p>구글·카카오는 계정 선택 화면을 항상 보여 준다({@code prompt=select_account}). 넣지 않으면 브라우저에 로그인된
 * 계정으로 자동 로그인되어, 여러 계정이 로그인된 브라우저나 공용 기기에서 다른 계정을 고를 수 없다. 없는 제공자 이름(주소 오타 등)도 서버 오류(500)가 아니라
 * 꺼진 제공자와 같이 처리한다.
 */
public class EnabledProvidersAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

	static final String AUTHORIZATION_BASE_URI = "/oauth2/authorization";

	private static final String REGISTRATION_ID = "registration_id";

	/** 계정 선택 화면을 지원하는 제공자. 네이버는 이 값을 지원하지 않는다. */
	private static final java.util.Set<String> SELECT_ACCOUNT_PROVIDERS = java.util.Set.of("google", "kakao");

	private final DefaultOAuth2AuthorizationRequestResolver delegate;

	private final AuthProperties properties;

	public EnabledProvidersAuthorizationRequestResolver(ClientRegistrationRepository repository,
			AuthProperties properties) {
		this.delegate = new DefaultOAuth2AuthorizationRequestResolver(repository, AUTHORIZATION_BASE_URI);
		this.delegate.setAuthorizationRequestCustomizer(builder -> builder.attributes(attributes -> {
			if (SELECT_ACCOUNT_PROVIDERS.contains(attributes.get(REGISTRATION_ID))) {
				builder.additionalParameters(parameters -> parameters.put("prompt", "select_account"));
			}
		}));
		this.properties = properties;
	}

	@Override
	public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
		return filter(() -> delegate.resolve(request));
	}

	@Override
	public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
		return filter(() -> delegate.resolve(request, clientRegistrationId));
	}

	private OAuth2AuthorizationRequest filter(Supplier<OAuth2AuthorizationRequest> resolver) {
		OAuth2AuthorizationRequest request;
		try {
			request = resolver.get();
		}
		catch (IllegalArgumentException ex) {
			// 등록되지 않은 제공자 이름 (Spring의 InvalidClientRegistrationIdException은 공개 클래스가 아니다)
			return null;
		}
		if (request == null) {
			return null;
		}
		String registrationId = request.getAttribute(REGISTRATION_ID);
		return properties.isEnabled(registrationId) ? request : null;
	}

}
