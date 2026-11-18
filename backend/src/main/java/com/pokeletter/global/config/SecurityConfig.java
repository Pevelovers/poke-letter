package com.pokeletter.global.config;

import com.pokeletter.auth.AuthProperties;
import com.pokeletter.auth.EnabledProvidersAuthorizationRequestResolver;
import com.pokeletter.auth.LoggingAuthenticationFailureHandler;
import com.pokeletter.auth.PokeLetterOAuth2UserService;
import com.pokeletter.auth.PokeLetterOidcUserService;
import com.pokeletter.global.error.JsonSecurityErrorHandler;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

/**
 * 보안 설정. 트리 주인은 OAuth로 로그인하고 세션 쿠키로 유지한다 (POL-ACC-01, 03).
 *
 * <ul>
 * <li>로그인이 필요한 POST·DELETE는 CSRF 토큰을 검증한다. SPA는 {@code XSRF-TOKEN} 쿠키 값을
 * {@code X-XSRF-TOKEN} 헤더로 보낸다 (POL-ABU-04)
 * <li>익명 메시지 작성은 세션이 없으므로 CSRF 대상에서 뺀다
 * <li>인증 실패는 로그인 페이지로 보내지 않고 401 JSON으로 답한다
 * </ul>
 *
 * <p>웹 서버 없이 실행하는 시드 프로필에서는 만들지 않는다.
 */
@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class SecurityConfig {

	private static final String[] PUBLIC_PATHS = {
		"/actuator/health", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**", "/error",
		"/api/v1/config", "/api/v1/characters", "/api/v1/balls", "/t/*",
	};

	private static final String ANONYMOUS_MESSAGE_PATH = "/api/v1/trees/*/messages";

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, ClientRegistrationRepository clientRegistrations,
			AuthProperties authProperties, PokeLetterOAuth2UserService oauth2UserService,
			PokeLetterOidcUserService oidcUserService) throws Exception {
		JsonSecurityErrorHandler errorHandler = new JsonSecurityErrorHandler();
		return http
			.csrf(csrf -> csrf
				.spa()
				.ignoringRequestMatchers(PathPatternRequestMatcher.pathPattern(HttpMethod.POST, ANONYMOUS_MESSAGE_PATH)))
			.httpBasic(basic -> basic.disable())
			.formLogin(form -> form.disable())
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(PUBLIC_PATHS).permitAll()
				.requestMatchers(HttpMethod.GET, "/api/v1/trees/*").permitAll()
				.requestMatchers(HttpMethod.POST, ANONYMOUS_MESSAGE_PATH).permitAll()
				.anyRequest().authenticated())
			.oauth2Login(login -> login
				.authorizationEndpoint(endpoint -> endpoint.authorizationRequestResolver(
						new EnabledProvidersAuthorizationRequestResolver(clientRegistrations, authProperties)))
				.userInfoEndpoint(userInfo -> userInfo
					.userService(oauth2UserService)
					.oidcUserService(oidcUserService))
				.defaultSuccessUrl(authProperties.successUrl(), true)
				.failureHandler(new LoggingAuthenticationFailureHandler(authProperties.failureUrl())))
			.logout(logout -> logout
				.logoutUrl("/api/v1/auth/logout")
				.logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)))
			.exceptionHandling(exceptions -> exceptions
				.authenticationEntryPoint(errorHandler)
				.accessDeniedHandler(errorHandler))
			.build();
	}

}
