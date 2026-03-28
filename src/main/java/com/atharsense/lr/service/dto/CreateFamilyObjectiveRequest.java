package com.atharsense.lr.service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateFamilyObjectiveRequest(
    @NotBlank @Size(max = 255) String name,
    @Size(max = 1000) String description,
    @NotEmpty List<@NotBlank @Size(max = 50) String> kidLogins,
    @NotEmpty List<@Valid CreateFamilyObjectiveItemDefinitionRequest> itemDefinitions
) {}

