package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.Bill;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating and updating Bills.
 */
public record CreateBillRequest(
    @NotNull(message = "Description is required")
    @Size(min = 1, max = 200, message = "Description must be between 1 and 200 characters")
    String description,

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.00", message = "Amount must be greater than or equal to 0")
    BigDecimal amount,

    @NotNull(message = "Bill date is required")
    LocalDate billDate,

    LocalDate dueDate,

    LocalDate paidDate,

    @NotNull(message = "Status is required")
    Bill.BillStatus status,

    @Size(max = 500, message = "Receipt URL must not exceed 500 characters")
    String receiptUrl,

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    String notes,

    @NotNull(message = "Payment method is required")
    Bill.PaymentMethod paymentMethod,

    Boolean isRecurring,

    Long subscriptionId
) {}

