package com.pokeletter.user;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByProviderAndProviderUserId(Provider provider, String providerUserId);

	/**
	 * 계정을 지운다. 트리와 메시지는 DB의 ON DELETE CASCADE가 지운다 (POL-PRV-03).
	 *
	 * <p>엔티티 삭제(deleteById)를 쓰면 영속성 컨텍스트에 남은 트리가 계정을 참조해 실패할 수 있어 DELETE 쿼리를
	 * 직접 쓴다.
	 */
	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from User u where u.id = :id")
	int deleteWithCascade(@Param("id") Long id);

}
