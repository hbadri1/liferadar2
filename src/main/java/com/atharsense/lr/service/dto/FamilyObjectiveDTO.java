package com.atharsense.lr.service.dto;

import java.time.Instant;
import java.util.List;

public record FamilyObjectiveDTO(
    Long id,
    Long kidId,
    String kidLogin,
    String kidName,
    String name,
    String description,
    Boolean active,
    Instant createdAt,
    List<FamilyObjectiveItemDefinitionDTO> itemDefinitions
) {}

