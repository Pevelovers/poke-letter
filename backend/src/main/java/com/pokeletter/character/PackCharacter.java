package com.pokeletter.character;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 캐릭터 팩의 캐릭터 (현재는 포켓몬 팩만 있다).
 *
 * <p>{@code java.lang.Character}와 이름이 겹치지 않도록 PackCharacter로 부른다. 데이터는 시드 스크립트가
 * 넣으며(POL-IP-04), id는 {@code 도감 번호 × 100 + 폼 번호} 규칙으로 정해 다시 시드해도 바뀌지 않는다.
 */
@Entity
@Table(name = "characters")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PackCharacter {

	@Id
	private Integer id;

	@Column(nullable = false, length = 20)
	private String pack;

	/** 전국도감 번호. */
	@Column(name = "dex_no", nullable = false)
	private Integer dexNo;

	/** {@code base} 또는 리전폼. 한 지역에 폼이 여럿이면 접미사로 구분한다 (예: {@code paldea-combat}). */
	@Column(nullable = false, length = 20)
	private String form;

	@Column(name = "name_ko", nullable = false, length = 50)
	private String nameKo;

	/** 외부 스프라이트 URL. 이미지는 직접 호스팅하지 않는다 (POL-IP-03). */
	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	/** 폼이 처음 나온 세대 (POL-CHR-07). */
	@Column(nullable = false)
	private Short generation;

	@Column(nullable = false, length = 10)
	private String type1;

	@Column(length = 10)
	private String type2;

	@Column(name = "sort_order", nullable = false)
	private Integer sortOrder;

	@Column(nullable = false)
	private boolean active;

	public PackCharacter(Integer id, String pack, Integer dexNo, String form, String nameKo,
			String imageUrl, Short generation, String type1, String type2, Integer sortOrder) {
		this.id = id;
		this.pack = pack;
		this.dexNo = dexNo;
		this.form = form;
		this.nameKo = nameKo;
		this.imageUrl = imageUrl;
		this.generation = generation;
		this.type1 = type1;
		this.type2 = type2;
		this.sortOrder = sortOrder;
		this.active = true;
	}

}
