package com.atharsense.lr.notification.service.push;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationPushConfiguration {

    @Bean
    @ConditionalOnMissingBean(NotificationPushGateway.class)
    NotificationPushGateway notificationPushGateway() {
        return notification -> {
            // WebSocket push is optional and can be disabled by configuration.
        };
    }
}

