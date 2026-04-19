package com.atharsense.lr.notification.service.push;

import com.atharsense.lr.notification.domain.Notification;
import java.time.Instant;

public interface NotificationPushGateway {
    void push(Notification notification);

    record NotificationPushPayload(Long id, String type, String title, String message, String actionUrl, Instant createdDate) {}
}


