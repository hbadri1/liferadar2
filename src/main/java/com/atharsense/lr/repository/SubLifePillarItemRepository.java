package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubLifePillarItem;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubLifePillarItem entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubLifePillarItemRepository extends JpaRepository<SubLifePillarItem, Long>, JpaSpecificationExecutor<SubLifePillarItem> {}
