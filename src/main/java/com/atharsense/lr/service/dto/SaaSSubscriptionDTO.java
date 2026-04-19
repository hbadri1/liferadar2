package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.SaaSSubscription;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for SaaS Subscription response.
 */
public record SaaSSubscriptionDTO(
    Long id,
    String serviceName,
    String description,
    BigDecimal monthlyCost,
    BigDecimal annualCost,
    LocalDate subscriptionDate,
    LocalDate renewalDate,
    SaaSSubscription.BillingCycle billingCycle,
    SaaSSubscription.SubscriptionStatus status,
    String providerUrl,
    String accountEmail,
    String accountUsername,
    String notes,
    Boolean isShared,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate,
    Long ownerId
) {}


