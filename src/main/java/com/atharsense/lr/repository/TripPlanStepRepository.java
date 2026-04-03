package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TripPlanStep;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TripPlanStep entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TripPlanStepRepository extends JpaRepository<TripPlanStep, Long> {
    List<TripPlanStep> findByTripPlanIdOrderBySequenceAsc(Long tripPlanId);

    @Query(
        """
        select (count(s) > 0)
        from TripPlanStep s
        where s.tripPlan.id = :tripPlanId
          and s.startDate <= :endDate
          and s.endDate >= :startDate
        """
    )
    boolean existsOverlappingStep(
        @Param("tripPlanId") Long tripPlanId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query(
        """
        select (count(s) > 0)
        from TripPlanStep s
        where s.tripPlan.id = :tripPlanId
          and s.id <> :stepId
          and s.startDate <= :endDate
          and s.endDate >= :startDate
        """
    )
    boolean existsOverlappingStepExcludingCurrent(
        @Param("tripPlanId") Long tripPlanId,
        @Param("stepId") Long stepId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Modifying
    @Query("DELETE FROM TripPlanStep s WHERE s.tripPlan.id = :tripPlanId")
    void deleteByTripPlanId(Long tripPlanId);
}
