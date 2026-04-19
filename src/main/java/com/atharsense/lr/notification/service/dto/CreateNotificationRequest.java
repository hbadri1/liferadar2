package com.atharsense.lr.notification.service.dto;

import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import com.atharsense.lr.notification.domain.enumeration.NotificationSourceType;
import com.atharsense.lr.notification.domain.enumeration.NotificationType;
import java.util.EnumSet;
import java.util.Set;

public record CreateNotificationRequest(
    Recipient recipient,
    NotificationType type,
    NotificationSourceType sourceType,
    String sourceId,
    String title,
    String message,
    String actionUrl,
    String payloadJson,
    String deduplicationKey,
    Set<NotificationChannelType> channels
) {
    public CreateNotificationRequest {
        channels = channels == null || channels.isEmpty() ? EnumSet.of(NotificationChannelType.PORTAL) : EnumSet.copyOf(channels);
    }

    public record Recipient(Long userId, String userLogin, String email) {}
}

