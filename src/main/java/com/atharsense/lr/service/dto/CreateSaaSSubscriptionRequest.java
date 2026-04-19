package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.SaaSSubscription;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating and updating SaaS Subscriptions.
 */
public record CreateSaaSSubscriptionRequest(
    @NotNull(message = "Service name is required")
    @Size(min = 1, max = 200, message = "Service name must be between 1 and 200 characters")
    String serviceName,

    @Size(max = 800, message = "Description must not exceed 800 characters")
    String description,

    @NotNull(message = "Monthly cost is required")
    @DecimalMin(value = "0.00", message = "Monthly cost must be greater than or equal to 0")
    BigDecimal monthlyCost,

    @DecimalMin(value = "0.00", message = "Annual cost must be greater than or equal to 0")
    BigDecimal annualCost,

    @NotNull(message = "Subscription date is required")
    LocalDate subscriptionDate,

    LocalDate renewalDate,

    @NotNull(message = "Billing cycle is required")
    SaaSSubscription.BillingCycle billingCycle,

    @NotNull(message = "Status is required")
    SaaSSubscription.SubscriptionStatus status,

    @Size(max = 500, message = "Provider URL must not exceed 500 characters")
    String providerUrl,

    @Size(max = 200, message = "Account email must not exceed 200 characters")
    String accountEmail,

    @Size(max = 200, message = "Account username must not exceed 200 characters")
    String accountUsername,

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    String notes,

    Boolean isShared
) {}

