package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

/** 구글 로그인: ID 토큰의 subject(고유 ID)로 계정과 연결한다. */
@Service
public class PokeLetterOidcUserService extends OidcUserService {

	private final LoginUserRegistrar registrar;

	PokeLetterOidcUserService(LoginUserRegistrar registrar) {
		this.registrar = registrar;
	}

	@Override
	public OidcUser loadUser(OidcUserRequest request) {
		OidcUser user = super.loadUser(request);
		Long userId = registrar.findOrCreate(Provider.GOOGLE, user.getSubject()).getId();
		return new OidcLoginUser(userId, user.getIdToken());
	}

}
