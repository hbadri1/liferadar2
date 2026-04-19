package com.atharsense.lr.service.dto;

import java.math.BigDecimal;

/**
 * DTO for subscription metrics and analytics.
 */
public record SubscriptionMetricsDTO(
    int totalSubscriptions,
    int activeSubscriptions,
    int pausedSubscriptions,
    int cancelledSubscriptions,
    BigDecimal totalMonthlyCost,
    BigDecimal totalAnnualCost,
    BigDecimal averageMonthlyCost,
    int upcomingRenewalsCount
) {}

