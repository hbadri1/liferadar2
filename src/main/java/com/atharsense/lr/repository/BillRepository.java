package com.atharsense.lr.repository;

import com.atharsense.lr.domain.Bill;
import com.atharsense.lr.domain.Bill.BillStatus;
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
 * Spring Data JPA repository for the {@link Bill} entity.
 */
@Repository
public interface BillRepository extends JpaRepository<Bill, Long>, JpaSpecificationExecutor<Bill> {
    List<Bill> findByOwnerId(Long ownerId);

    Page<Bill> findByOwnerId(Long ownerId, Pageable pageable);

    Optional<Bill> findByIdAndOwnerId(Long id, Long ownerId);

    @Query("SELECT b FROM Bill b WHERE b.owner.id = :ownerId AND b.status = :status")
    List<Bill> findByOwnerIdAndStatus(@Param("ownerId") Long ownerId, @Param("status") BillStatus status);

    @Query(
        "SELECT b FROM Bill b WHERE b.owner.id = :ownerId " +
        "AND b.dueDate <= :dueDate AND b.status != 'PAID' AND b.status != 'CANCELLED'"
    )
    List<Bill> findOverdueBills(@Param("ownerId") Long ownerId, @Param("dueDate") LocalDate dueDate);

    @Query(
        "SELECT b FROM Bill b WHERE b.owner.id = :ownerId " +
        "AND b.subscription.id = :subscriptionId"
    )
    List<Bill> findByOwnerIdAndSubscriptionId(@Param("ownerId") Long ownerId, @Param("subscriptionId") Long subscriptionId);

    @Query(
        "SELECT b FROM Bill b WHERE b.owner.id = :ownerId " +
        "AND b.billDate >= :startDate AND b.billDate <= :endDate"
    )
    List<Bill> findBillsByDateRange(
        @Param("ownerId") Long ownerId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        UPDATE Bill b
           SET b.status = :overdueStatus
         WHERE b.dueDate IS NOT NULL
           AND b.dueDate < :businessDate
           AND b.status IN :openStatuses
        """
    )
    int markBillsOverdue(
        @Param("businessDate") LocalDate businessDate,
        @Param("overdueStatus") BillStatus overdueStatus,
        @Param("openStatuses") Collection<BillStatus> openStatuses
    );

    Page<Bill> findByOwnerIdOrderByBillDateDesc(Long ownerId, Pageable pageable);
}

