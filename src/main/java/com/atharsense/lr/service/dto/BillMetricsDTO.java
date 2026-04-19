package com.atharsense.lr.service.dto;

import java.math.BigDecimal;

/**
 * DTO for bill metrics and analytics.
 */
public record BillMetricsDTO(
    int totalBills,
    int paidBills,
    int pendingBills,
    int overdueBills,
    int cancelledBills,
    BigDecimal totalBillAmount,
    BigDecimal paidAmount,
    BigDecimal pendingAmount,
    BigDecimal overdueAmount,
    BigDecimal averageBillAmount
) {}

