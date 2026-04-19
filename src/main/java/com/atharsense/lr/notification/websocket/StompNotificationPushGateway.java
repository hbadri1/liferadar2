package com.atharsense.lr.notification.websocket;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.service.push.NotificationPushGateway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "application.notifications.websocket", name = "enabled", havingValue = "true")
public class StompNotificationPushGateway implements NotificationPushGateway {

    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ApplicationProperties applicationProperties;

    public StompNotificationPushGateway(SimpMessagingTemplate simpMessagingTemplate, ApplicationProperties applicationProperties) {
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.applicationProperties = applicationProperties;
    }

    @Override
    public void push(Notification notification) {
        if (notification.getRecipient() == null || notification.getRecipient().getLogin() == null) {
            return;
        }
        simpMessagingTemplate.convertAndSendToUser(
            notification.getRecipient().getLogin(),
            applicationProperties.getNotifications().getWebsocket().getUserDestination(),
            new NotificationPushPayload(
                notification.getId(),
                notification.getType() != null ? notification.getType().name() : null,
                notification.getTitle(),
                notification.getMessage(),
                notification.getActionUrl(),
                notification.getCreatedDate()
            )
        );
    }
}

