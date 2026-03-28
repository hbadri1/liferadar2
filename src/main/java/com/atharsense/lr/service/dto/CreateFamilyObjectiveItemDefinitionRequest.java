package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.ObjectiveUnit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFamilyObjectiveItemDefinitionRequest(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 1000) String description,
    @NotNull ObjectiveUnit unit
) {}

