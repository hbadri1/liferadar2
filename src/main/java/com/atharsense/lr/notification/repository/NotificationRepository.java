package com.atharsense.lr.notification.repository;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.enumeration.NotificationStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findAllByRecipientLogin(String recipientLogin, Pageable pageable);

    Page<Notification> findAllByRecipientLoginAndStatus(String recipientLogin, NotificationStatus status, Pageable pageable);

    @EntityGraph(attributePaths = { "deliveries", "recipient" })
    Optional<Notification> findOneByIdAndRecipientLogin(Long id, String recipientLogin);

    Optional<Notification> findOneByDeduplicationKey(String deduplicationKey);

    long countByRecipientLoginAndStatus(String recipientLogin, NotificationStatus status);
}

