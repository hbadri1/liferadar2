package com.atharsense.lr.repository;

import com.atharsense.lr.domain.TripPlan;
import com.atharsense.lr.domain.enumeration.TripType;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the TripPlan entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TripPlanRepository extends JpaRepository<TripPlan, Long>, JpaSpecificationExecutor<TripPlan> {
    List<TripPlan> findByOwnerUserLoginOrderByStartDateAsc(String login);
    List<TripPlan> findByOwnerIdOrderByStartDateAsc(Long ownerId);
    List<TripPlan> findByTripTypeAndOwnerFamilyIdOrderByStartDateAsc(TripType tripType, Long familyId);
    List<TripPlan> findByTripTypeAndOwnerUserFamilyIdOrderByStartDateAsc(TripType tripType, Long familyId);
    List<TripPlan> findByTripTypeAndOwnerUserLoginOrderByStartDateAsc(TripType tripType, String ownerLogin);
}
