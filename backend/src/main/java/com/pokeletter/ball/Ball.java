package com.pokeletter.ball;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장식용 볼. 작성자가 메시지를 보낼 때 고른다.
 *
 * <p>id는 PokéAPI 아이템 id를 그대로 써서 다시 시드해도 바뀌지 않는다. 일반 볼과 이름이 겹치는 히스이 볼은
 * {@code 몬스터볼(히스이)}처럼 표기한다.
 */
@Entity
@Table(name = "balls")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Ball {

	@Id
	private Integer id;

	/** PokéAPI 아이템 이름 (예: {@code poke-ball}, {@code lapoke-ball}). */
	@Column(name = "item_key", nullable = false, unique = true, length = 30)
	private String itemKey;

	@Column(name = "name_ko", nullable = false, length = 30)
	private String nameKo;

	/** 외부 스프라이트 URL. 이미지는 직접 호스팅하지 않는다 (POL-IP-03). */
	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(name = "sort_order", nullable = false)
	private Integer sortOrder;

	@Column(nullable = false)
	private boolean active;

	public Ball(Integer id, String itemKey, String nameKo, String imageUrl, Integer sortOrder) {
		this.id = id;
		this.itemKey = itemKey;
		this.nameKo = nameKo;
		this.imageUrl = imageUrl;
		this.sortOrder = sortOrder;
		this.active = true;
	}

}
