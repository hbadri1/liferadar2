package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.Bill;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Bill response.
 */
public record BillDTO(
    Long id,
    String description,
    BigDecimal amount,
    LocalDate billDate,
    LocalDate dueDate,
    LocalDate paidDate,
    Bill.BillStatus status,
    String receiptUrl,
    String notes,
    Bill.PaymentMethod paymentMethod,
    Boolean isRecurring,
    LocalDateTime createdDate,
    LocalDateTime lastModifiedDate,
    Long ownerId,
    Long subscriptionId,
    String subscriptionName
) {}


