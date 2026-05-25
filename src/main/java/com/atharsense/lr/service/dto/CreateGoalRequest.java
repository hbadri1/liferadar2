package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateGoalRequest(
    @NotBlank @Size(min = 2, max = 150) String title,
    @Size(max = 2000) String description,
    @NotNull GoalType goalType,
    GoalCategory category,
    @NotNull GoalStatus status,
    @NotNull GoalPriority priority,
    @NotNull GoalVisibility visibility,
    LocalDate startDate,
    LocalDate targetDate,
    @NotNull GoalProgressMode progressMode,
    @Min(0) @Max(100) Integer progressPercentage,
    BigDecimal targetValue,
    BigDecimal currentValue,
    BigDecimal baselineValue,
    @Size(max = 50) String unit,
    GoalPriority confidenceLevel,
    GoalPriority difficultyLevel,
    @Size(max = 2000) String motivation,
    @Size(max = 2000) String successCriteria,
    @Size(max = 1000) String riskNotes,
    @Size(max = 1000) String blockerNotes,
    GoalReviewFrequency reviewFrequency,
    Long pillarId
) {}

