package com.pokeletter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.pokeletter.ball.Ball;
import com.pokeletter.ball.BallRepository;
import com.pokeletter.character.PackCharacter;
import com.pokeletter.character.PackCharacterRepository;
import com.pokeletter.message.Message;
import com.pokeletter.message.MessageRepository;
import com.pokeletter.message.SelectionType;
import com.pokeletter.tree.Tree;
import com.pokeletter.tree.TreeRepository;
import com.pokeletter.user.Provider;
import com.pokeletter.user.User;
import com.pokeletter.user.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

/** V1 마이그레이션의 제약이 정책대로 동작하는지 확인한다. */
@Import(TestcontainersConfiguration.class)
@SpringBootTest
@Transactional
class SchemaConstraintTests {

	@Autowired
	UserRepository userRepository;

	@Autowired
	TreeRepository treeRepository;

	@Autowired
	PackCharacterRepository characterRepository;

	@Autowired
	BallRepository ballRepository;

	@Autowired
	MessageRepository messageRepository;

	@Autowired
	EntityManager entityManager;

	@Test
	void 같은_제공자의_같은_계정은_한_번만_저장된다() {
		userRepository.saveAndFlush(new User(Provider.KAKAO, "12345"));

		assertThatThrownBy(() -> userRepository.saveAndFlush(new User(Provider.KAKAO, "12345")))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 다른_제공자라면_고유_ID가_같아도_별도_계정이다() {
		userRepository.saveAndFlush(new User(Provider.KAKAO, "12345"));
		userRepository.saveAndFlush(new User(Provider.GOOGLE, "12345"));

		assertThat(userRepository.count()).isEqualTo(2);
	}

	@Test
	void 계정당_트리는_하나만_만들_수_있다() {
		User owner = userRepository.saveAndFlush(new User(Provider.GOOGLE, "owner"));
		treeRepository.saveAndFlush(new Tree("aB3dE5fG7h", owner, "지우의 트리"));

		assertThatThrownBy(() -> treeRepository.saveAndFlush(new Tree("Zz9yY8xX7w", owner, "두 번째 트리")))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 공유_ID는_영숫자_10자만_허용한다() {
		User owner = userRepository.saveAndFlush(new User(Provider.GOOGLE, "owner"));

		assertThatThrownBy(() -> treeRepository.saveAndFlush(new Tree("short-id!!", owner, "지우의 트리")))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 공백뿐인_트리_이름은_저장되지_않는다() {
		User owner = userRepository.saveAndFlush(new User(Provider.GOOGLE, "owner"));

		assertThatThrownBy(() -> treeRepository.saveAndFlush(new Tree("aB3dE5fG7h", owner, "   ")))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 계정을_지우면_트리와_메시지도_함께_지워진다() {
		User owner = userRepository.saveAndFlush(new User(Provider.KAKAO, "owner"));
		Tree tree = treeRepository.saveAndFlush(new Tree("aB3dE5fG7h", owner, "지우의 트리"));
		PackCharacter pikachu = characterRepository.saveAndFlush(pikachu());
		Ball pokeBall = ballRepository.saveAndFlush(pokeBall());
		messageRepository.saveAndFlush(
				new Message(tree, "이슬", "메리 크리스마스!", pikachu, SelectionType.CHOSEN, pokeBall));
		entityManager.clear();

		// 탈퇴(POL-PRV-03)는 users 행 삭제 하나로 끝나야 한다. 나머지는 DB의 ON DELETE CASCADE가 지운다
		entityManager.createNativeQuery("DELETE FROM users WHERE id = :id")
			.setParameter("id", owner.getId())
			.executeUpdate();

		assertThat(treeRepository.count()).isZero();
		assertThat(messageRepository.count()).isZero();
		assertThat(characterRepository.count()).isEqualTo(1);
		assertThat(ballRepository.count()).isEqualTo(1);
	}

	@Test
	void 한글_닉네임은_글자_수_기준으로_10자까지_저장된다() {
		Tree tree = treeRepository.saveAndFlush(
				new Tree("aB3dE5fG7h", userRepository.saveAndFlush(new User(Provider.KAKAO, "o")), "트리"));
		PackCharacter pikachu = characterRepository.saveAndFlush(pikachu());
		Ball pokeBall = ballRepository.saveAndFlush(pokeBall());

		messageRepository.saveAndFlush(
				new Message(tree, "가나다라마바사아자차", "내용", pikachu, SelectionType.RANDOM, pokeBall));

		assertThatThrownBy(() -> messageRepository.saveAndFlush(
				new Message(tree, "가나다라마바사아자차카", "내용", pikachu, SelectionType.RANDOM, pokeBall)))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 없는_볼로는_메시지를_저장할_수_없다() {
		Tree tree = treeRepository.saveAndFlush(
				new Tree("aB3dE5fG7h", userRepository.saveAndFlush(new User(Provider.KAKAO, "o")), "트리"));
		PackCharacter pikachu = characterRepository.saveAndFlush(pikachu());

		assertThatThrownBy(() -> entityManager
			.createNativeQuery("INSERT INTO messages (tree_id, nickname, content, character_id, selection_type, ball_id)"
					+ " VALUES (:tree, '이슬', '내용', :character, 'CHOSEN', 9999)")
			.setParameter("tree", tree.getId())
			.setParameter("character", pikachu.getId())
			.executeUpdate())
			.isInstanceOf(PersistenceException.class);
	}

	@Test
	void 같은_팩의_같은_도감번호와_폼은_한_번만_저장된다() {
		characterRepository.saveAndFlush(pikachu());

		assertThatThrownBy(() -> characterRepository.saveAndFlush(new PackCharacter(
				2501, "pokemon", 25, "base", "피카츄", "https://example.com/25.png", (short) 1, "electric", null, 2501)))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 리전폼은_코드로만_구분하고_화면_이름은_원래_이름_그대로다() {
		characterRepository.saveAndFlush(tauros(12800, "base"));
		characterRepository.saveAndFlush(tauros(12801, "paldea-combat"));
		characterRepository.saveAndFlush(tauros(12802, "paldea-blaze"));
		characterRepository.saveAndFlush(tauros(12803, "paldea-aqua"));

		assertThat(characterRepository.findAll()).hasSize(4)
			.allSatisfy(tauros -> assertThat(tauros.getNameKo()).isEqualTo("켄타로스"));
	}

	@Test
	void 세대는_1부터_9까지만_허용한다() {
		assertThatThrownBy(() -> characterRepository.saveAndFlush(new PackCharacter(
				2500, "pokemon", 25, "base", "피카츄", "https://example.com/25.png", (short) 10, "electric", null, 2500)))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void 볼은_PokeAPI_아이템_이름으로_한_번만_저장되고_히스이_볼은_이름으로_구분한다() {
		ballRepository.saveAndFlush(pokeBall());
		ballRepository.saveAndFlush(new Ball(1785, "lapoke-ball", "몬스터볼(히스이)", "https://example.com/la.png", 2));

		assertThatThrownBy(() -> ballRepository.saveAndFlush(
				new Ball(9999, "poke-ball", "몬스터볼", "https://example.com/dup.png", 3)))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	private static PackCharacter pikachu() {
		return new PackCharacter(2500, "pokemon", 25, "base", "피카츄", "https://example.com/25.png", (short) 1,
				"electric", null, 2500);
	}

	private static PackCharacter tauros(int id, String form) {
		return new PackCharacter(id, "pokemon", 128, form, "켄타로스", "https://example.com/128.png", (short) 9,
				"fighting", null, id);
	}

	private static Ball pokeBall() {
		return new Ball(4, "poke-ball", "몬스터볼", "https://example.com/poke-ball.png", 1);
	}

}
