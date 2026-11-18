package com.pokeletter.user;

import com.pokeletter.message.MessageRepository;
import com.pokeletter.tree.TreeRepository;
import java.util.Locale;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class MeService {

	private final UserRepository userRepository;

	private final TreeRepository treeRepository;

	private final MessageRepository messageRepository;

	MeService(UserRepository userRepository, TreeRepository treeRepository, MessageRepository messageRepository) {
		this.userRepository = userRepository;
		this.treeRepository = treeRepository;
		this.messageRepository = messageRepository;
	}

	/** 세션은 있지만 계정이 지워졌다면 비어 있다. */
	@Transactional(readOnly = true)
	Optional<MeResponse> me(Long userId) {
		return userRepository.findById(userId).map(user -> new MeResponse(
				user.getProvider().name().toLowerCase(Locale.ROOT),
				treeRepository.findByOwnerId(userId)
					.map(tree -> new MeResponse.TreeSummary(tree.getPublicId(), tree.getName(),
							messageRepository.countByTreeId(tree.getId())))
					.orElse(null)));
	}

	/** 트리와 메시지는 DB의 ON DELETE CASCADE로 함께 지워진다 (POL-PRV-03). */
	@Transactional
	void withdraw(Long userId) {
		userRepository.deleteWithCascade(userId);
	}

}
