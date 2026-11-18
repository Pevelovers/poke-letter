package com.pokeletter.auth;

import com.pokeletter.user.Provider;

/** 로그인한 트리 주인. 세션에 저장되며, 제공자에게서 받은 정보는 고유 ID 말고는 담지 않는다 (POL-PRV-01). */
public interface LoginPrincipal {

	Long userId();

	Provider provider();

}
