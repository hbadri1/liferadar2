package com.atharsense.lr.notification.service;

import com.atharsense.lr.config.ApplicationProperties;
import com.atharsense.lr.domain.SaaSSubscription.RenewalReminderOption;
import com.atharsense.lr.notification.domain.enumeration.NotificationSourceType;
import com.atharsense.lr.notification.domain.enumeration.NotificationType;
import com.atharsense.lr.notification.service.dto.CreateNotificationRequest;
import com.atharsense.lr.notification.service.provider.BillingNotificationCandidateProvider;
import com.atharsense.lr.service.SaaSSubscriptionService;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class NotificationScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationScheduler.class);

    private final NotificationService notificationService;
    private final NotificationStatusMaintenanceService notificationStatusMaintenanceService;
    private final BillingNotificationCandidateProvider billingCandidateProvider;
    private final SaaSSubscriptionService subscriptionService;
    private final ApplicationProperties applicationProperties;

    public NotificationScheduler(
        NotificationService notificationService,
        NotificationStatusMaintenanceService notificationStatusMaintenanceService,
        BillingNotificationCandidateProvider billingCandidateProvider,
        SaaSSubscriptionService subscriptionService,
        ApplicationProperties applicationProperties
    ) {
        this.notificationService = notificationService;
        this.notificationStatusMaintenanceService = notificationStatusMaintenanceService;
        this.billingCandidateProvider = billingCandidateProvider;
        this.subscriptionService = subscriptionService;
        this.applicationProperties = applicationProperties;
    }

    @Scheduled(cron = "${application.notifications.scheduler.cron:0 0 0 * * *}", zone = "${application.notifications.scheduler.zone:UTC}")
    public void scanBillingNotifications() {
        if (!applicationProperties.getNotifications().isEnabled()) {
            return;
        }

        ZoneId zoneId = ZoneId.of(applicationProperties.getNotifications().getScheduler().getZone());
        LocalDate businessDate = LocalDate.now(zoneId);

        int autoRenewedSubscriptions = subscriptionService.processDueAutoRenewals(businessDate);
        if (autoRenewedSubscriptions > 0) {
            LOG.info("Processed {} due auto-renewing subscription(s) for business date {}", autoRenewedSubscriptions, businessDate);
        }

        NotificationStatusMaintenanceService.StatusUpdateResult statusUpdateResult = notificationStatusMaintenanceService.syncStatuses(
            businessDate
        );
        if (statusUpdateResult.overdueBills() > 0 || statusUpdateResult.expiredSubscriptions() > 0) {
            LOG.info(
                "Status maintenance updated {} bill(s) to OVERDUE and {} subscription(s) to EXPIRED for business date {}",
                statusUpdateResult.overdueBills(),
                statusUpdateResult.expiredSubscriptions(),
                businessDate
            );
        }

        List<CreateNotificationRequest> requests = new ArrayList<>();

        billingCandidateProvider.findSubscriptionsDueForBilling(businessDate).forEach(candidate ->
            requests.add(
                new CreateNotificationRequest(
                    recipient(candidate.recipientUserId(), candidate.recipientLogin(), candidate.recipientEmail()),
                    NotificationType.SUBSCRIPTION_BILLING_DUE,
                    NotificationSourceType.SUBSCRIPTION,
                    candidate.subscriptionId(),
                    "Subscription billing due: " + candidate.subscriptionName(),
                    "Your subscription '" + candidate.subscriptionName() + "' is due for billing on " + candidate.billingDate() +
                    formatAmount(candidate.amount(), candidate.currency()) + ".",
                    candidate.actionUrl(),
                    null,
                    dedupKey("subscription-billing", candidate.subscriptionId(), businessDate),
                    applicationProperties.getNotifications().getScheduler().getDefaultChannels()
                )
            )
        );

        billingCandidateProvider.findBillsDueToday(businessDate).forEach(candidate ->
            requests.add(
                new CreateNotificationRequest(
                    recipient(candidate.recipientUserId(), candidate.recipientLogin(), candidate.recipientEmail()),
                    NotificationType.BILL_DUE_TODAY,
                    NotificationSourceType.BILL,
                    candidate.billId(),
                    "Bill due today: " + candidate.billName(),
                    "Your bill '" + candidate.billName() + "' is due today (" + candidate.dueDate() + ")" +
                    formatAmount(candidate.amount(), candidate.currency()) + ".",
                    candidate.actionUrl(),
                    null,
                    dedupKey("bill-due", candidate.billId(), businessDate),
                    applicationProperties.getNotifications().getScheduler().getDefaultChannels()
                )
            )
        );

        billingCandidateProvider.findOverdueBills(businessDate).forEach(candidate ->
            requests.add(
                new CreateNotificationRequest(
                    recipient(candidate.recipientUserId(), candidate.recipientLogin(), candidate.recipientEmail()),
                    NotificationType.BILL_OVERDUE,
                    NotificationSourceType.BILL,
                    candidate.billId(),
                    "Overdue bill: " + candidate.billName(),
                    "Your bill '" + candidate.billName() + "' is overdue by " + candidate.overdueDays() + " day(s). Due date: " +
                    candidate.dueDate() + formatAmount(candidate.amount(), candidate.currency()) + ".",
                    candidate.actionUrl(),
                    null,
                    dedupKey("bill-overdue", candidate.billId(), businessDate),
                    applicationProperties.getNotifications().getScheduler().getDefaultChannels()
                )
            )
        );

        billingCandidateProvider.findUpcomingRenewalsForReminder(
            businessDate.plusWeeks(1),
            RenewalReminderOption.ONE_WEEK
        ).forEach(candidate ->
            requests.add(
                new CreateNotificationRequest(
                    recipient(candidate.recipientUserId(), candidate.recipientLogin(), candidate.recipientEmail()),
                    NotificationType.SUBSCRIPTION_RENEWAL_UPCOMING,
                    NotificationSourceType.SUBSCRIPTION,
                    candidate.subscriptionId(),
                    "Renewal in 1 week: " + candidate.subscriptionName(),
                    "Your auto-renewing subscription '" + candidate.subscriptionName() + "' renews in 1 week on " + candidate.renewalDate() +
                    formatAmount(candidate.amount(), candidate.currency()) + ".",
                    candidate.actionUrl(),
                    null,
                    dedupKey("subscription-renewal-one-week", candidate.subscriptionId(), candidate.renewalDate()),
                    applicationProperties.getNotifications().getScheduler().getDefaultChannels()
                )
            )
        );

        billingCandidateProvider.findUpcomingRenewalsForReminder(
            businessDate.plusDays(1),
            RenewalReminderOption.TWENTY_FOUR_HOURS
        ).forEach(candidate ->
            requests.add(
                new CreateNotificationRequest(
                    recipient(candidate.recipientUserId(), candidate.recipientLogin(), candidate.recipientEmail()),
                    NotificationType.SUBSCRIPTION_RENEWAL_UPCOMING,
                    NotificationSourceType.SUBSCRIPTION,
                    candidate.subscriptionId(),
                    "Renewal in 24 hours: " + candidate.subscriptionName(),
                    "Your auto-renewing subscription '" + candidate.subscriptionName() + "' renews in 24 hours on " + candidate.renewalDate() +
                    formatAmount(candidate.amount(), candidate.currency()) + ".",
                    candidate.actionUrl(),
                    null,
                    dedupKey("subscription-renewal-24-hours", candidate.subscriptionId(), candidate.renewalDate()),
                    applicationProperties.getNotifications().getScheduler().getDefaultChannels()
                )
            )
        );

        if (!requests.isEmpty()) {
            notificationService.createNotifications(requests);
            LOG.info("Created {} billing notifications for business date {}", requests.size(), businessDate);
        }
    }

    @Scheduled(cron = "${application.notifications.delivery.retry-cron:0 */15 * * * *}", zone = "${application.notifications.delivery.retry-zone:UTC}")
    public void processRetries() {
        if (!applicationProperties.getNotifications().isEnabled()) {
            return;
        }
        int processed = notificationService.processDueDeliveries(
            Instant.now(),
            applicationProperties.getNotifications().getDelivery().getBatchSize()
        );
        if (processed > 0) {
            LOG.info("Processed {} pending notification deliveries", processed);
        }
    }

    private CreateNotificationRequest.Recipient recipient(Long userId, String login, String email) {
        return new CreateNotificationRequest.Recipient(userId, login, email);
    }

    private String dedupKey(String prefix, String sourceId, LocalDate businessDate) {
        return String.join(":", prefix, StringUtils.defaultIfBlank(sourceId, "unknown"), businessDate.toString());
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) {
            return "";
        }
        NumberFormat numberFormat = NumberFormat.getNumberInstance(Locale.US);
        numberFormat.setMinimumFractionDigits(2);
        numberFormat.setMaximumFractionDigits(2);
        return " Amount: " + numberFormat.format(amount) + (StringUtils.isNotBlank(currency) ? " " + currency : "");
    }
}

