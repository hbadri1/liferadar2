package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TripPlanStep;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TripPlanStep entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TripPlanStepRepository extends JpaRepository<TripPlanStep, Long> {
    @EntityGraph(attributePaths = { "tripPlan", "subSteps" })
    @Query("select distinct s from TripPlanStep s where s.tripPlan.id = :tripPlanId order by s.sequence asc")
    List<TripPlanStep> findByTripPlanIdWithSubStepsOrderBySequenceAsc(@Param("tripPlanId") Long tripPlanId);

    @EntityGraph(attributePaths = { "tripPlan", "subSteps" })
    @Query("select distinct s from TripPlanStep s")
    List<TripPlanStep> findAllWithSubSteps();

    @EntityGraph(attributePaths = { "tripPlan", "subSteps" })
    Optional<TripPlanStep> findOneWithSubStepsById(Long id);


    @Modifying
    @Query("DELETE FROM TripPlanStep s WHERE s.tripPlan.id = :tripPlanId")
    void deleteByTripPlanId(@Param("tripPlanId") Long tripPlanId);
}
