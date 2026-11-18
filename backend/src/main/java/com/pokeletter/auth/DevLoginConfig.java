package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * <strong>개발 전용</strong> 로그인. {@code dev} 프로필에서만 만들어지며 운영에는 존재하지 않는다.
 *
 * <p>UI·기능을 확인할 때 실제 OAuth 없이 테스트 사용자로 로그인한다.
 *
 * <pre>
 * curl -i -c cookies.txt -X POST 'http://localhost:8080/dev/login?provider=KAKAO&amp;id=dev-user'
 * </pre>
 */
@Configuration
@Profile("dev")
class DevLoginConfig {

	/** 메인 보안 설정보다 먼저 {@code /dev/**}만 처리한다. */
	@Bean
	@Order(0)
	SecurityFilterChain devLoginFilterChain(HttpSecurity http) throws Exception {
		return http
			.securityMatcher("/dev/**")
			.csrf(csrf -> csrf.disable())
			.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
			.build();
	}

	@RestController
	static class DevLoginController {

		private final LoginUserRegistrar registrar;

		private final HttpSessionSecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

		DevLoginController(LoginUserRegistrar registrar) {
			this.registrar = registrar;
		}

		@PostMapping("/dev/login")
		ResponseEntity<Void> login(@RequestParam(defaultValue = "KAKAO") Provider provider,
				@RequestParam(defaultValue = "dev-user") String id, HttpServletRequest request,
				HttpServletResponse response) {
			Long userId = registrar.findOrCreate(provider, "dev:" + id).getId();
			OAuth2LoginUser principal = new OAuth2LoginUser(userId, provider);
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(new OAuth2AuthenticationToken(principal, principal.getAuthorities(),
					provider.name().toLowerCase()));
			contextRepository.saveContext(context, request, response);
			return ResponseEntity.noContent().build();
		}

	}

}
