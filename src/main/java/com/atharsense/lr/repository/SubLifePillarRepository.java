package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SubLifePillar;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SubLifePillar entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SubLifePillarRepository extends JpaRepository<SubLifePillar, Long>, JpaSpecificationExecutor<SubLifePillar> {}
