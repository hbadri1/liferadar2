package com.atharsense.lr.repository;

import com.atharsense.lr.domain.SaaSSubscription;
import com.atharsense.lr.domain.SaaSSubscription.SubscriptionStatus;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link SaaSSubscription} entity.
 */
@Repository
public interface SaaSSubscriptionRepository extends JpaRepository<SaaSSubscription, Long>, JpaSpecificationExecutor<SaaSSubscription> {
    List<SaaSSubscription> findByOwnerId(Long ownerId);

    Page<SaaSSubscription> findByOwnerId(Long ownerId, Pageable pageable);

    Optional<SaaSSubscription> findByIdAndOwnerId(Long id, Long ownerId);

    @Query(
        "SELECT s FROM SaaSSubscription s WHERE s.owner.id = :ownerId " +
        "AND s.status = 'ACTIVE' " +
        "AND s.renewalDate <= :renewalDate"
    )
    List<SaaSSubscription> findUpcomingRenewals(@Param("ownerId") Long ownerId, @Param("renewalDate") LocalDate renewalDate);

    @Query(
        "SELECT s FROM SaaSSubscription s WHERE s.owner.id = :ownerId " +
        "AND s.status != 'CANCELLED'"
    )
    List<SaaSSubscription> findActiveSubscriptions(@Param("ownerId") Long ownerId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE SaaSSubscription s
           SET s.status = :expiredStatus
         WHERE s.renewalDate IS NOT NULL
           AND s.renewalDate < :businessDate
           AND s.status IN :expirableStatuses
        """
    )
    int markSubscriptionsExpired(
        @Param("businessDate") LocalDate businessDate,
        @Param("expiredStatus") SubscriptionStatus expiredStatus,
        @Param("expirableStatuses") Collection<SubscriptionStatus> expirableStatuses
    );
}

