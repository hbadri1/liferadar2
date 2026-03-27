package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubPillarItem;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubPillarItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubPillarItemRepository extends JpaRepository<SubPillarItem, Long>, JpaSpecificationExecutor<SubPillarItem> {
	Optional<SubPillarItem> findByOwnerIdAndCode(Long ownerId, String code);

	Optional<SubPillarItem> findByOwnerIdAndCodeIgnoreCase(Long ownerId, String code);
}
