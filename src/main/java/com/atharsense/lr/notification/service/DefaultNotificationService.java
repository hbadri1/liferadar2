package com.atharsense.lr.notification.service;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.User;
import com.atharsense.lr.notification.domain.Notification;
import com.atharsense.lr.notification.domain.NotificationDelivery;
import com.atharsense.lr.notification.domain.enumeration.NotificationChannelType;
import com.atharsense.lr.notification.domain.enumeration.NotificationDeliveryStatus;
import com.atharsense.lr.notification.domain.enumeration.NotificationStatus;
import com.atharsense.lr.notification.repository.NotificationDeliveryRepository;
import com.atharsense.lr.notification.repository.NotificationRepository;
import com.atharsense.lr.notification.service.channel.NotificationChannel;
import com.atharsense.lr.notification.service.dto.CreateNotificationRequest;
import com.atharsense.lr.repository.UserRepository;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class DefaultNotificationService implements NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(DefaultNotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationDeliveryRepository notificationDeliveryRepository;
    private final UserRepository userRepository;
    private final ApplicationProperties applicationProperties;
    private final Map<NotificationChannelType, NotificationChannel> channelByType;

    public DefaultNotificationService(
        NotificationRepository notificationRepository,
        NotificationDeliveryRepository notificationDeliveryRepository,
        UserRepository userRepository,
        ApplicationProperties applicationProperties,
        List<NotificationChannel> channels
    ) {
        this.notificationRepository = notificationRepository;
        this.notificationDeliveryRepository = notificationDeliveryRepository;
        this.userRepository = userRepository;
        this.applicationProperties = applicationProperties;
        this.channelByType = channels.stream().collect(Collectors.toMap(NotificationChannel::getChannelType, channel -> channel));
    }

    @Override
    public Notification createNotification(CreateNotificationRequest request) {
        if (!applicationProperties.getNotifications().isEnabled()) {
            throw new IllegalStateException("Notification module is disabled");
        }

        if (StringUtils.isNotBlank(request.deduplicationKey())) {
            Notification existing = notificationRepository.findOneByDeduplicationKey(request.deduplicationKey()).orElse(null);
            if (existing != null) {
                return existing;
            }
        }

        User recipient = resolveRecipient(request.recipient());
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(request.type());
        notification.setSourceType(request.sourceType());
        notification.setSourceId(request.sourceId());
        notification.setTitle(StringUtils.defaultIfBlank(request.title(), request.type().name()));
        notification.setMessage(StringUtils.defaultIfBlank(request.message(), request.title()));
        notification.setActionUrl(request.actionUrl());
        notification.setPayloadJson(request.payloadJson());
        notification.setDeduplicationKey(request.deduplicationKey());
        notification.setStatus(NotificationStatus.UNREAD);

        Instant now = Instant.now();
        for (NotificationChannelType channelType : resolveEnabledChannels(request.channels())) {
            NotificationDelivery delivery = new NotificationDelivery();
            delivery.setChannelType(channelType);
            delivery.setStatus(NotificationDeliveryStatus.PENDING);
            delivery.setAttemptCount(0);
            delivery.setMaxAttempts(applicationProperties.getNotifications().getDelivery().getMaxAttempts());
            delivery.setNextAttemptAt(now);
            delivery.setDestination(resolveDestination(channelType, recipient, request));
            notification.addDelivery(delivery);
        }

        Notification saved = notificationRepository.saveAndFlush(notification);
        saved.getDeliveries().forEach(this::deliverNow);
        return saved;
    }

    @Override
    public List<Notification> createNotifications(Collection<CreateNotificationRequest> requests) {
        List<Notification> notifications = new ArrayList<>();
        for (CreateNotificationRequest request : requests) {
            notifications.add(createNotification(request));
        }
        return notifications;
    }

    @Override
    public int processDueDeliveries(Instant now, int batchSize) {
        List<NotificationDelivery> deliveries = notificationDeliveryRepository.findByStatusInAndNextAttemptAtLessThanEqualOrderByNextAttemptAtAsc(
            List.of(NotificationDeliveryStatus.PENDING, NotificationDeliveryStatus.RETRY_SCHEDULED),
            now,
            PageRequest.of(0, Math.max(batchSize, 1))
        );
        deliveries.forEach(this::deliverNow);
        return deliveries.size();
    }

    private Set<NotificationChannelType> resolveEnabledChannels(Set<NotificationChannelType> requestedChannels) {
        EnumSet<NotificationChannelType> enabled = EnumSet.noneOf(NotificationChannelType.class);
        for (NotificationChannelType channelType : requestedChannels) {
            if (channelType == NotificationChannelType.PORTAL && applicationProperties.getNotifications().getChannels().isUiEnabled()) {
                enabled.add(channelType);
            }
            if (channelType == NotificationChannelType.UI && applicationProperties.getNotifications().getChannels().isUiEnabled()) {
                enabled.add(channelType);
            }
            if (channelType == NotificationChannelType.EMAIL && applicationProperties.getNotifications().getChannels().isEmailEnabled()) {
                enabled.add(channelType);
            }
        }
        if (enabled.isEmpty() && applicationProperties.getNotifications().getChannels().isUiEnabled()) {
            enabled.add(NotificationChannelType.PORTAL);
        }
        return enabled;
    }

    private User resolveRecipient(CreateNotificationRequest.Recipient recipientRequest) {
        if (recipientRequest == null) {
            throw new IllegalArgumentException("Notification recipient is required");
        }
        if (recipientRequest.userId() != null) {
            return userRepository.findById(recipientRequest.userId()).orElseThrow(() -> new IllegalArgumentException("Recipient user was not found"));
        }
        if (StringUtils.isNotBlank(recipientRequest.userLogin())) {
            return userRepository.findOneByLogin(recipientRequest.userLogin().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Recipient user was not found"));
        }
        throw new IllegalArgumentException("Recipient user identifier is required");
    }

    private String resolveDestination(NotificationChannelType channelType, User recipient, CreateNotificationRequest request) {
        if (channelType == NotificationChannelType.EMAIL) {
            return StringUtils.firstNonBlank(request.recipient() != null ? request.recipient().email() : null, recipient.getEmail());
        }
        return recipient.getLogin();
    }

    private void deliverNow(NotificationDelivery delivery) {
        Notification notification = Objects.requireNonNull(delivery.getNotification());
        NotificationChannel channel = channelByType.get(delivery.getChannelType());
        if (channel == null) {
            delivery.setStatus(NotificationDeliveryStatus.SKIPPED);
            delivery.setFailureReason("No channel implementation registered for " + delivery.getChannelType());
            delivery.setLastAttemptAt(Instant.now());
            notificationDeliveryRepository.save(delivery);
            return;
        }

        NotificationChannel.DeliveryResult result = channel.deliver(notification, delivery);
        Instant now = Instant.now();
        delivery.setAttemptCount(delivery.getAttemptCount() + 1);
        delivery.setLastAttemptAt(now);

        if (result.success()) {
            delivery.setStatus(NotificationDeliveryStatus.DELIVERED);
            delivery.setDeliveredAt(now);
            delivery.setFailureReason(null);
            delivery.setProviderMessageId(result.providerMessageId());
            delivery.setNextAttemptAt(null);
        } else {
            boolean retryAllowed = result.retryable() && delivery.getAttemptCount() < delivery.getMaxAttempts();
            delivery.setFailureReason(trimFailureReason(result.failureReason()));
            delivery.setProviderMessageId(result.providerMessageId());
            if (retryAllowed) {
                delivery.setStatus(NotificationDeliveryStatus.RETRY_SCHEDULED);
                long backoffMinutes = (long) applicationProperties.getNotifications().getDelivery().getRetryBackoffMinutes() * delivery.getAttemptCount();
                delivery.setNextAttemptAt(now.plus(backoffMinutes, ChronoUnit.MINUTES));
            } else {
                delivery.setStatus(NotificationDeliveryStatus.FAILED);
                delivery.setNextAttemptAt(null);
            }
            LOG.warn(
                "Notification delivery failed [notificationId={}, channel={}, attempt={}/{}]: {}",
                notification.getId(),
                delivery.getChannelType(),
                delivery.getAttemptCount(),
                delivery.getMaxAttempts(),
                delivery.getFailureReason()
            );
        }

        notificationDeliveryRepository.save(delivery);
    }

    private String trimFailureReason(String failureReason) {
        if (failureReason == null) {
            return null;
        }
        return StringUtils.abbreviate(failureReason, 4000);
    }
}

