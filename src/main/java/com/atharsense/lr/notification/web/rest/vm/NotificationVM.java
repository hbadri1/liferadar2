package com.atharsense.lr.notification.web.rest.vm;

import com.atharsense.lr.notification.domain.Notification;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record NotificationVM(
    Long id,
    String type,
    String sourceType,
    String sourceId,
    String title,
    String message,
    String actionUrl,
    String status,
    Instant readAt,
    Instant createdDate,
    List<DeliveryVM> deliveries
) {
    public static NotificationVM from(Notification notification) {
        return new NotificationVM(
            notification.getId(),
            notification.getType() != null ? notification.getType().name() : null,
            notification.getSourceType() != null ? notification.getSourceType().name() : null,
            notification.getSourceId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getActionUrl(),
            notification.getStatus() != null ? notification.getStatus().name() : null,
            notification.getReadAt(),
            notification.getCreatedDate(),
            notification.getDeliveries()
                .stream()
                .sorted(Comparator.comparing(delivery -> delivery.getChannelType().name()))
                .map(delivery ->
                    new DeliveryVM(
                        delivery.getChannelType().name(),
                        delivery.getStatus().name(),
                        delivery.getAttemptCount(),
                        delivery.getLastAttemptAt(),
                        delivery.getDeliveredAt(),
                        delivery.getFailureReason()
                    )
                )
                .toList()
        );
    }

    public record DeliveryVM(
        String channel,
        String status,
        Integer attemptCount,
        Instant lastAttemptAt,
        Instant deliveredAt,
        String failureReason
    ) {}
}

