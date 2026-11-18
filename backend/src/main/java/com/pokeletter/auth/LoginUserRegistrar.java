package com.pokeletter.auth;

import com.pokeletter.user.Provider;
import com.pokeletter.user.User;
import com.pokeletter.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

/** 처음 로그인하면 계정을 만들고, 이미 있으면 그 계정을 쓴다. 제공자가 다르면 다른 계정이다 (POL-ACC-04). */
@Service
public class LoginUserRegistrar {

	private final UserRepository userRepository;

	LoginUserRegistrar(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User findOrCreate(Provider provider, String providerUserId) {
		return userRepository.findByProviderAndProviderUserId(provider, providerUserId).orElseGet(() -> {
			try {
				return userRepository.saveAndFlush(new User(provider, providerUserId));
			}
			catch (DataIntegrityViolationException ex) {
				// 같은 계정으로 동시에 처음 로그인한 경우: 먼저 만들어진 계정을 쓴다
				return userRepository.findByProviderAndProviderUserId(provider, providerUserId).orElseThrow(() -> ex);
			}
		});
	}

}
