package com.pokeletter.auth;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

/** 꺼진 제공자로는 로그인을 시작하지 않는다 (POL-ACC-02). */
public class EnabledProvidersAuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {

	static final String AUTHORIZATION_BASE_URI = "/oauth2/authorization";

	private final DefaultOAuth2AuthorizationRequestResolver delegate;

	private final AuthProperties properties;

	public EnabledProvidersAuthorizationRequestResolver(ClientRegistrationRepository repository,
			AuthProperties properties) {
		this.delegate = new DefaultOAuth2AuthorizationRequestResolver(repository, AUTHORIZATION_BASE_URI);
		this.properties = properties;
	}

	@Override
	public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
		return filter(delegate.resolve(request));
	}

	@Override
	public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
		return filter(delegate.resolve(request, clientRegistrationId));
	}

	private OAuth2AuthorizationRequest filter(OAuth2AuthorizationRequest request) {
		if (request == null) {
			return null;
		}
		String registrationId = request.getAttribute("registration_id");
		return properties.isEnabled(registrationId) ? request : null;
	}

}
