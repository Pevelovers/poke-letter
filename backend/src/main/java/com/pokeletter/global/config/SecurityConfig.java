package com.pokeletter.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 기본 보안 설정.
 *
 * <p>인증 방식(세션/JWT/소셜 로그인)은 기획에서 결정한다. 지금은 헬스 체크와 API 문서만 공개하고 나머지는
 * 인증을 요구한다.
 */
@Configuration
public class SecurityConfig {

	private static final String[] PUBLIC_PATHS = {
		"/actuator/health", "/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**",
	};

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			.csrf(csrf -> csrf.disable())
			.httpBasic(basic -> basic.disable())
			.formLogin(form -> form.disable())
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(PUBLIC_PATHS).permitAll()
				.anyRequest().authenticated())
			.exceptionHandling(Customizer.withDefaults())
			.build();
	}

}
