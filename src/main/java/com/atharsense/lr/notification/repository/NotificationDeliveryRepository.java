package com.atharsense.lr.notification.repository;

import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationDeliveryStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, Long> {
    @EntityGraph(attributePaths = { "notification", "notification.recipient" })
    List<NotificationDelivery> findByStatusInAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAsc(
        Collection<NotificationDeliveryStatus> statuses,
        Instant nextAttemptAt,
        Pageable pageable
    );
}

