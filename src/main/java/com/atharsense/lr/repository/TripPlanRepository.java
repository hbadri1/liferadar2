package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TripPlan;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TripPlan entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TripPlanRepository extends JpaRepository<TripPlan, Long>, JpaSpecificationExecutor<TripPlan> {}
