package com.atharsense.lr.notification.service;

import com.atharsense.lr.domain.Bill.BillStatus;
import com.atharsense.lr.domain.SaaSSubscription.SubscriptionStatus;
import com.atharsense.lr.repository.BillRepository;
import com.atharsense.lr.repository.SaaSSubscriptionRepository;
import java.time.LocalDate;
import java.util.EnumSet;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationStatusMaintenanceService {

    private final BillRepository billRepository;
    private final SaaSSubscriptionRepository subscriptionRepository;

    public NotificationStatusMaintenanceService(BillRepository billRepository, SaaSSubscriptionRepository subscriptionRepository) {
        this.billRepository = billRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public StatusUpdateResult syncStatuses(LocalDate businessDate) {
        int overdueBills = billRepository.markBillsOverdue(
            businessDate,
            BillStatus.OVERDUE,
            EnumSet.of(BillStatus.PENDING, BillStatus.PARTIAL)
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

