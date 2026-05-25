package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.GoalMilestoneStatus;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record CreateGoalMilestoneRequest(
    @NotBlank @Size(min = 1, max = 200) String title,
    @Size(max = 1000) String description,
    GoalMilestoneStatus status,
    LocalDate dueDate,
    Integer sortOrder,
    @Min(0) @Max(100) Integer progressWeight
) {}

