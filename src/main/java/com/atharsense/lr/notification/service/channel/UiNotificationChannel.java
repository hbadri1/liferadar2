package com.atharsense.lr.notification.service.channel;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import com.atharsense.lr.notification.service.push.NotificationPushGateway;
import org.springframework.stereotype.Component;

@Component
public class UiNotificationChannel implements NotificationChannel {

    private final NotificationPushGateway notificationPushGateway;

    public UiNotificationChannel(NotificationPushGateway notificationPushGateway) {
        this.notificationPushGateway = notificationPushGateway;
    }

    @Override
    public NotificationChannelType getChannelType() {
        return NotificationChannelType.UI;
    }

    @Override
    public DeliveryResult deliver(Notification notification, NotificationDelivery delivery) {
        notificationPushGateway.push(notification);
        return DeliveryResult.success(null);
    }
}

