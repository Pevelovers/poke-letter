package com.pokeletter.auth;

import java.util.List;
import java.util.Locale;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 로그인 설정.
 *
 * @param enabledProviders 켜진 로그인 제공자 (POL-ACC-02). 꺼진 제공자로는 로그인을 시작할 수 없다
 * @param successUrl 로그인 성공 후 이동할 경로
 * @param failureUrl 로그인 실패 후 이동할 경로
 */
@ConfigurationProperties("pokeletter.auth")
public record AuthProperties(List<String> enabledProviders, String successUrl, String failureUrl) {

	public boolean isEnabled(String registrationId) {
		return enabledProviders.stream().anyMatch(id -> id.trim().equalsIgnoreCase(registrationId));
	}

	public List<String> enabledProviderIds() {
		return enabledProviders.stream().map(id -> id.trim().toLowerCase(Locale.ROOT)).toList();
	}

}
