package com.atharsense.lr.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateTripPlanRequest(
    @NotBlank @Size(max = 160) String title,
    @Size(max = 800) String description,
    @NotNull LocalDate startDate,
    @NotNull LocalDate endDate,
    Boolean isActive
) {}

