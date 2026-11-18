package com.pokeletter.tree;

import com.pokeletter.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

/** 크리스마스 트리. 계정당 1개 (POL-TRE-01). */
@Entity
@Table(name = "trees")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tree {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 공유 링크 ID, 영숫자 10자 (POL-TRE-03). 내부 id는 URL에 노출하지 않는다. */
	@Column(name = "public_id", nullable = false, unique = true, length = 10)
	private String publicId;

	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "owner_id", nullable = false, unique = true)
	private User owner;

	/** 필터를 통과한 이름만 저장한다 (POL-FLT-06). 만든 뒤 바꿀 수 없다. */
	@Column(nullable = false, length = 20)
	private String name;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	public Tree(String publicId, User owner, String name) {
		this.publicId = publicId;
		this.owner = owner;
		this.name = name;
	}

}
