package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TripPlanStep;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TripPlanStep entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TripPlanStepRepository extends JpaRepository<TripPlanStep, Long> {}
