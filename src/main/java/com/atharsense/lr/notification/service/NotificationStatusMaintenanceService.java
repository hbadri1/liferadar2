package com.atharsense.lr.notification.service;

import com.atharsense.lr.domain.SaaSSubscription.SubscriptionStatus;
import com.atharsense.lr.repository.SaaSSubscriptionRepository;
import java.time.LocalDate;
import java.util.EnumSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationStatusMaintenanceService {

    private final SaaSSubscriptionRepository subscriptionRepository;

    public NotificationStatusMaintenanceService(SaaSSubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    public StatusUpdateResult syncStatuses(LocalDate businessDate) {
        int overdueBills = subscriptionRepository.markExpensesOverdue(
            businessDate,
            SubscriptionStatus.OVERDUE,
            EnumSet.of(SubscriptionStatus.PENDING, SubscriptionStatus.PARTIAL)
        );

        int expiredSubscriptions = subscriptionRepository.markSubscriptionsExpired(
            businessDate,
            SubscriptionStatus.EXPIRED,
            EnumSet.of(SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED)
        );

        return new StatusUpdateResult(overdueBills, expiredSubscriptions);
    }

    public record StatusUpdateResult(int overdueBills, int expiredSubscriptions) {}
}

