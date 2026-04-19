package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.SaaSSubscription;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for listing subscriptions.
 */
public record SubscriptionSummaryDTO(
    Long id,
    String serviceName,
    BigDecimal monthlyCost,
    BigDecimal annualCost,
    LocalDate renewalDate,
    SaaSSubscription.SubscriptionStatus status,
    SaaSSubscription.BillingCycle billingCycle,
    Boolean isShared
) {}

