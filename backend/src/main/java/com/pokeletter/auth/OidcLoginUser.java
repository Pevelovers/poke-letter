package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;

/**
 * 구글(OIDC) 로그인 사용자. 범위가 {@code openid}뿐이라 ID 토큰에 이메일·이름이 없다. 사용자 정보 API도 부르지
 * 않는다.
 */
public class OidcLoginUser extends DefaultOidcUser implements LoginPrincipal {

	private final Long userId;

	public OidcLoginUser(Long userId, OidcIdToken idToken) {
		super(OAuth2LoginUser.AUTHORITIES, idToken);
		this.userId = userId;
	}

	@Override
	public Long userId() {
		return userId;
	}

	@Override
	public Provider provider() {
		return Provider.GOOGLE;
	}

}
