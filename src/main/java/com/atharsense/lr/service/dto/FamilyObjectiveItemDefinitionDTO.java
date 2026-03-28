package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.ObjectiveUnit;
import java.util.List;

public record FamilyObjectiveItemDefinitionDTO(
    Long id,
    String name,
    String description,
    ObjectiveUnit unit,
    List<FamilyObjectiveProgressDTO> progressHistory
) {}

