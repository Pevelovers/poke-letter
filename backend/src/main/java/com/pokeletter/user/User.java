package com.pokeletter.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

/** 트리 주인 계정. 제공자 고유 ID만 저장한다 (POL-PRV-01). */
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Provider provider;

	/** 제공자 고유 ID. 로그에 남기지 않는다 (POL-PRV-05). */
	@Column(name = "provider_user_id", nullable = false)
	private String providerUserId;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	public User(Provider provider, String providerUserId) {
		this.provider = provider;
		this.providerUserId = providerUserId;
	}

}
