package com.atharsense.lr.repository;

import com.atharsense.lr.domain.ExtendedUser;
import com.atharsense.lr.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the ExtendedUser entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ExtendedUserRepository extends JpaRepository<ExtendedUser, Long> {
    Optional<ExtendedUser> findOneByUserId(Long userId);

    Optional<ExtendedUser> findOneByUser(User user);

    /** All members of a family (used for FAMILY_SHARED goal syncing). */
    List<ExtendedUser> findByFamilyId(Long familyId);
}
