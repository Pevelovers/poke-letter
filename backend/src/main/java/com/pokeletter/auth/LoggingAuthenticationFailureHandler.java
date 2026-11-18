package com.pokeletter.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

/**
 * OAuth 로그인 실패 이유를 로그에 남기고 실패 경로로 보낸다.
 *
 * <p>기본 처리기는 이유를 남기지 않아 "로그인이 필요해요"만 보이고 원인을 알 수 없었다. 오류 코드와 설명만 남기며
 * 토큰이나 키는 남기지 않는다.
 */
@Slf4j
public class LoggingAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

	/** 제공자가 돌려준 오류 파라미터. 값을 그대로 남겨도 되는 것만 둔다. code, state 같은 값은 이름만 남긴다. */
	private static final Set<String> LOGGABLE_PARAMETERS = Set.of("error", "error_description", "error_code",
			"error_uri");

	public LoggingAuthenticationFailureHandler(String failureUrl) {
		super(failureUrl);
	}

	@Override
	public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException exception) throws IOException, jakarta.servlet.ServletException {
		String provider = request.getRequestURI().replaceFirst("^.*/", "");
		if (exception instanceof OAuth2AuthenticationException oauth2) {
			log.warn("OAuth 로그인 실패 ({}): [{}] {} / 돌아온 파라미터: {}", provider,
					oauth2.getError().getErrorCode(), oauth2.getError().getDescription(), describeParameters(request));
		}
		else {
			log.warn("OAuth 로그인 실패 ({}): {}", provider, exception.getMessage());
		}
		super.onAuthenticationFailure(request, response, exception);
	}

	private static List<String> describeParameters(HttpServletRequest request) {
		return request.getParameterMap().entrySet().stream()
			.map(entry -> LOGGABLE_PARAMETERS.contains(entry.getKey())
					? entry.getKey() + "=" + String.join(",", entry.getValue())
					: entry.getKey() + "=(생략)")
			.toList();
	}

}
