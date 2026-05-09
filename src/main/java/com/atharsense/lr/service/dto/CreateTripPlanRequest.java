package com.atharsense.lr.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateTripPlanRequest(
    @NotBlank @Size(max = 160) String title,
    @Size(max = 800) String description,
    @NotNull LocalDateTime startDate,
    @NotNull LocalDateTime endDate,
    Boolean isActive,
    @Size(max = 4000) String actionsJson
) {}

