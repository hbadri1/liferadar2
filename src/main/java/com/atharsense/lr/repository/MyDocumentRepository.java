package com.atharsense.lr.repository;

import com.atharsense.lr.domain.MyDocument;
import com.atharsense.lr.domain.MyDocument.DocumentStatus;
import com.atharsense.lr.domain.MyDocument.RenewalReminderOption;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MyDocumentRepository extends JpaRepository<MyDocument, Long> {
    List<MyDocument> findByOwnerId(Long ownerId);

    Page<MyDocument> findByOwnerId(Long ownerId, Pageable pageable);

    Optional<MyDocument> findByIdAndOwnerId(Long id, Long ownerId);

    @Query(
        """
        select d
        from MyDocument d
        join fetch d.owner o
        join fetch o.user u
        where o.active = true
          and d.renewalReminder = :reminderOption
          and d.renewalDate = :renewalDate
          and d.status in :statuses
        """
    )
    List<MyDocument> findReminderCandidates(
        @Param("renewalDate") LocalDate renewalDate,
        @Param("reminderOption") RenewalReminderOption reminderOption,
        @Param("statuses") Collection<DocumentStatus> statuses
    );

    @Query(
        """
        select d
        from MyDocument d
        join fetch d.owner o
        join fetch o.user u
        where o.active = true
          and d.renewalDate = :renewalDate
          and d.status in :statuses
        """
    )
    List<MyDocument> findDueTodayCandidates(@Param("renewalDate") LocalDate renewalDate, @Param("statuses") Collection<DocumentStatus> statuses);

    @Query(
        """
        select d
        from MyDocument d
        join fetch d.owner o
        join fetch o.user u
        where o.active = true
          and d.renewalDate < :businessDate
          and d.status in :statuses
        """
    )
    List<MyDocument> findOverdueCandidates(@Param("businessDate") LocalDate businessDate, @Param("statuses") Collection<DocumentStatus> statuses);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(
        """
        update MyDocument d
           set d.status = :expiredStatus
         where d.renewalDate < :businessDate
           and d.status in :updatableStatuses
        """
    )
    int markDocumentsExpired(
        @Param("businessDate") LocalDate businessDate,
        @Param("expiredStatus") DocumentStatus expiredStatus,
        @Param("updatableStatuses") Collection<DocumentStatus> updatableStatuses
    );
}
