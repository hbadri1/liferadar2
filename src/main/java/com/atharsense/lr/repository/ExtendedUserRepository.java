package com.atharsense.lr.repository;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the ExtendedUser entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ExtendedUserRepository extends JpaRepository<ExtendedUser, Long> {
    Optional<ExtendedUser> findOneByUserId(Long userId);

    Optional<ExtendedUser> findOneByUser(User user);
}
