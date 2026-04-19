package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.Bill;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for listing bills.
 */
public record BillSummaryDTO(
    Long id,
    String description,
    BigDecimal amount,
    LocalDate billDate,
    LocalDate dueDate,
    Bill.BillStatus status,
    Bill.PaymentMethod paymentMethod,
    String subscriptionName
) {}

