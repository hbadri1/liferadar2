package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubPillar;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubPillar entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubPillarRepository extends JpaRepository<SubPillar, Long>, JpaSpecificationExecutor<SubPillar> {
	Optional<SubPillar> findByOwnerIdAndCode(Long ownerId, String code);

	Optional<SubPillar> findByOwnerIdAndCodeIgnoreCase(Long ownerId, String code);
}
