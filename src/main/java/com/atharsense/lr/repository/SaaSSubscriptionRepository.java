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

    boolean existsByOwnerIdAndServiceNameAndSubscriptionDateAndStatus(
        Long ownerId,
        String serviceName,
        LocalDate subscriptionDate,
        SubscriptionStatus status
    );

    @Query(
        "SELECT s FROM SaaSSubscription s WHERE s.owner.id = :ownerId " +
        "AND s.status = 'ACTIVE' " +
        "AND s.renewalDate <= :renewalDate"
    )
    List<SaaSSubscription> findUpcomingRenewals(@Param("ownerId") Long ownerId, @Param("renewalDate") LocalDate renewalDate);

    @Query(
        "SELECT s FROM SaaSSubscription s WHERE s.owner.id = :ownerId " +
        "AND s.status NOT IN ('CANCELLED', 'EXPIRED')"
    )
    List<SaaSSubscription> findActiveSubscriptions(@Param("ownerId") Long ownerId);

    @Query(
        "SELECT s FROM SaaSSubscription s WHERE s.status = :status " +
        "AND (s.autoRenewal = true OR s.manualRenewal = true) " +
        "AND s.renewalDate IS NOT NULL " +
        "AND s.renewalDate <= :businessDate"
    )
    List<SaaSSubscription> findAutoRenewSubscriptionsDueOnOrBefore(
        @Param("businessDate") LocalDate businessDate,
        @Param("status") SubscriptionStatus status
    );

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

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE SaaSSubscription s
           SET s.status = :overdueStatus
         WHERE s.dueDate IS NOT NULL
           AND s.dueDate < :businessDate
           AND s.status IN :openStatuses
        """
    )
    int markExpensesOverdue(
        @Param("businessDate") LocalDate businessDate,
        @Param("overdueStatus") SubscriptionStatus overdueStatus,
        @Param("openStatuses") Collection<SubscriptionStatus> openStatuses
    );
}

