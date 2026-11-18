package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

/** 카카오·네이버(OAuth2) 로그인 사용자. 제공자가 준 속성은 버리고 내부 사용자 id만 담는다. */
public class OAuth2LoginUser extends DefaultOAuth2User implements LoginPrincipal {

	static final List<GrantedAuthority> AUTHORITIES = List.of(new SimpleGrantedAuthority("ROLE_USER"));

	private static final String NAME_ATTRIBUTE = "userId";

	private final Long userId;

	private final Provider provider;

	public OAuth2LoginUser(Long userId, Provider provider) {
		super(AUTHORITIES, Map.of(NAME_ATTRIBUTE, userId), NAME_ATTRIBUTE);
		this.userId = userId;
		this.provider = provider;
	}

	@Override
	public Long userId() {
		return userId;
	}

	@Override
	public Provider provider() {
		return provider;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return AUTHORITIES;
	}

}
