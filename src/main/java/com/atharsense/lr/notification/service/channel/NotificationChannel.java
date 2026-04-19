package com.atharsense.lr.notification.service.channel;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;

public interface NotificationChannel {
    NotificationChannelType getChannelType();

    DeliveryResult deliver(Notification notification, NotificationDelivery delivery);

    record DeliveryResult(boolean success, String providerMessageId, String failureReason, boolean retryable) {
        public static DeliveryResult success(String providerMessageId) {
            return new DeliveryResult(true, providerMessageId, null, false);
        }

        public static DeliveryResult failure(String failureReason, boolean retryable) {
            return new DeliveryResult(false, null, failureReason, retryable);
        }
    }
}

