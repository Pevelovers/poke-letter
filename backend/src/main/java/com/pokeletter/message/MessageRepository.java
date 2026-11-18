package com.pokeletter.message;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long> {

	long countByTreeId(Long treeId);

}
