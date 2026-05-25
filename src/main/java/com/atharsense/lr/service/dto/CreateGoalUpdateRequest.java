package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.GoalPriority;
import com.atharsense.lr.domain.enumeration.GoalStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalUpdateRequest(
    @NotNull LocalDate updateDate,
    @Size(max = 2000) String summary,
    @Min(0) @Max(100) Integer progressPercentage,
    BigDecimal currentValue,
    GoalPriority confidenceLevel,
    GoalStatus status,
    @Size(max = 50) String mood,
    @Size(max = 1000) String blockers,
    @Size(max = 1000) String nextStep
) {}

