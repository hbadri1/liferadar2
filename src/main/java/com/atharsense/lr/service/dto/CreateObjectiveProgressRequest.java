package com.atharsense.lr.service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateObjectiveProgressRequest(
    @NotNull @DecimalMin(value = "0.00") BigDecimal value,
    @Size(max = 1000) String notes
) {}

