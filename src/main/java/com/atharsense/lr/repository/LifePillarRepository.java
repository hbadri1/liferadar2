package com.atharsense.lr.repository;

import com.atharsense.lr.domain.LifePillar;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the LifePillar entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LifePillarRepository extends JpaRepository<LifePillar, Long>, JpaSpecificationExecutor<LifePillar> {}
