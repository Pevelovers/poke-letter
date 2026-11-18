package com.pokeletter.message;

import com.pokeletter.character.PackCharacter;
import com.pokeletter.tree.Tree;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

/** 메시지 = 트리에 달리는 장식. 닉네임과 내용은 마스킹한 뒤에 저장한다 (POL-FLT-03). */
@Entity
@Table(name = "messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "tree_id", nullable = false)
	private Tree tree;

	@Column(nullable = false, length = 10)
	private String nickname;

	@Column(nullable = false, length = 500)
	private String content;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "character_id", nullable = false)
	private PackCharacter character;

	@Enumerated(EnumType.STRING)
	@Column(name = "selection_type", nullable = false, length = 10)
	private SelectionType selectionType;

	/** 장식 모양 번호. 서버가 작성 시 무작위로 정한다. 범위는 디자인 확정 후 정한다. */
	@Column(name = "decoration_style", nullable = false)
	private Short decorationStyle;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	public Message(Tree tree, String nickname, String content, PackCharacter character,
			SelectionType selectionType, Short decorationStyle) {
		this.tree = tree;
		this.nickname = nickname;
		this.content = content;
		this.character = character;
		this.selectionType = selectionType;
		this.decorationStyle = decorationStyle;
	}

}
