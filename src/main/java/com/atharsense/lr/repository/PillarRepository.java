package com.atharsense.lr.repository;

import com.atharsense.lr.domain.Pillar;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Pillar entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PillarRepository extends JpaRepository<Pillar, Long>, JpaSpecificationExecutor<Pillar> {
	Optional<Pillar> findByOwnerIdAndCode(Long ownerId, String code);
}
