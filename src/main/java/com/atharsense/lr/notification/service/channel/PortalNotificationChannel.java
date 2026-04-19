package com.atharsense.lr.notification.service.channel;

import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import com.atharsense.lr.notification.service.push.NotificationPushGateway;
import org.springframework.stereotype.Component;

@Component
public class PortalNotificationChannel implements NotificationChannel {

    private final NotificationPushGateway notificationPushGateway;

    public PortalNotificationChannel(NotificationPushGateway notificationPushGateway) {
        this.notificationPushGateway = notificationPushGateway;
    }

    @Override
    public NotificationChannelType getChannelType() {
        return NotificationChannelType.PORTAL;
    }

    @Override
    public DeliveryResult deliver(Notification notification, NotificationDelivery delivery) {
        notificationPushGateway.push(notification);
        return DeliveryResult.success(null);
    }
}

