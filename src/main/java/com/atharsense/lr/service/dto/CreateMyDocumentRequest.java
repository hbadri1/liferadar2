package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.MyDocument.DocumentStatus;
import com.atharsense.lr.domain.MyDocument.RenewalReminderOption;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateMyDocumentRequest(
    @NotNull @Size(max = 200) String name,
    @Size(max = 120) String documentType,
    @Size(max = 200) String issuer,
    LocalDate issueDate,
    @NotNull LocalDate renewalDate,
    DocumentStatus status,
    RenewalReminderOption renewalReminder,
    @Size(max = 1000) String notes
) {}
