package com.atharsense.lr.notification.service.provider;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface BillingNotificationCandidateProvider {
    List<SubscriptionDueCandidate> findSubscriptionsDueForBilling(LocalDate businessDate);

    List<BillDueCandidate> findBillsDueToday(LocalDate businessDate);

    List<BillOverdueCandidate> findOverdueBills(LocalDate businessDate);

    List<UpcomingRenewalCandidate> findUpcomingRenewals(LocalDate fromDate, LocalDate toDate);

    record SubscriptionDueCandidate(
        Long recipientUserId,
        String recipientLogin,
        String recipientEmail,
        String subscriptionId,
        String subscriptionName,
        BigDecimal amount,
        String currency,
        LocalDate billingDate,
        String actionUrl
    ) {}

    record BillDueCandidate(
        Long recipientUserId,
        String recipientLogin,
        String recipientEmail,
        String billId,
        String billName,
        BigDecimal amount,
        String currency,
        LocalDate dueDate,
        String actionUrl
    ) {}

    record BillOverdueCandidate(
        Long recipientUserId,
        String recipientLogin,
        String recipientEmail,
        String billId,
        String billName,
        BigDecimal amount,
        String currency,
        LocalDate dueDate,
        long overdueDays,
        String actionUrl
    ) {}

    record UpcomingRenewalCandidate(
        Long recipientUserId,
        String recipientLogin,
        String recipientEmail,
        String subscriptionId,
        String subscriptionName,
        BigDecimal amount,
        String currency,
        LocalDate renewalDate,
        String actionUrl
    ) {}
}


