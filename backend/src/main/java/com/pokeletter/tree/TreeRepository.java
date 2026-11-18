package com.pokeletter.tree;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TreeRepository extends JpaRepository<Tree, Long> {

	Optional<Tree> findByPublicId(String publicId);

	boolean existsByOwnerId(Long ownerId);

	Optional<Tree> findByOwnerId(Long ownerId);

}
