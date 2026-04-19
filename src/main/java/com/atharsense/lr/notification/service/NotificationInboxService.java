package com.atharsense.lr.notification.service;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.enumeration.NotificationStatus;
import com.atharsense.lr.notification.repository.NotificationRepository;
import com.atharsense.lr.security.SecurityUtils;
import jakarta.transaction.Transactional;
import java.time.Instant;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class NotificationInboxService {

    private final NotificationRepository notificationRepository;

    public NotificationInboxService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<Notification> findCurrentUserNotifications(Boolean unreadOnly, Pageable pageable) {
        String login = getCurrentLogin();
        Page<Notification> page;
        if (Boolean.TRUE.equals(unreadOnly)) {
            page = notificationRepository.findAllByRecipientLoginAndStatus(login, NotificationStatus.UNREAD, pageable);
        } else {
            page = notificationRepository.findAllByRecipientLogin(login, pageable);
        }

        // Initialize deliveries within transactional scope without collection fetch join pagination.
        page.forEach(notification -> Hibernate.initialize(notification.getDeliveries()));
        return page;
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public long countUnreadForCurrentUser() {
        return notificationRepository.countByRecipientLoginAndStatus(getCurrentLogin(), NotificationStatus.UNREAD);
    }

    public Notification markCurrentUserNotificationRead(Long notificationId) {
        Notification notification = notificationRepository
            .findOneByIdAndRecipientLogin(notificationId, getCurrentLogin())
            .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (notification.getStatus() == NotificationStatus.UNREAD) {
            notification.markRead(Instant.now());
        }
        return notificationRepository.save(notification);
    }

    public int markAllCurrentUserNotificationsRead() {
        Page<Notification> page = notificationRepository.findAllByRecipientLoginAndStatus(
            getCurrentLogin(),
            NotificationStatus.UNREAD,
            Pageable.unpaged()
        );
        Instant now = Instant.now();
        page.forEach(notification -> notification.markRead(now));
        notificationRepository.saveAll(page.getContent());
        return page.getNumberOfElements();
    }

    private String getCurrentLogin() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new IllegalStateException("Current user login is unavailable"));
    }
}

