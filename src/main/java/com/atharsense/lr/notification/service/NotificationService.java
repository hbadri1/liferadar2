package com.atharsense.lr.notification.service;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.service.dto.CreateNotificationRequest;
import java.time.Instant;
import java.util.Collection;
import java.util.List;

public interface NotificationService {
    Notification createNotification(CreateNotificationRequest request);

    List<Notification> createNotifications(Collection<CreateNotificationRequest> requests);

    int processDueDeliveries(Instant now, int batchSize);
}

