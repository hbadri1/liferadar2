package com.atharsense.lr.service.dto;

import com.atharsense.lr.domain.enumeration.ObjectiveMilestone;
import com.atharsense.lr.domain.enumeration.ObjectiveUnit;
import java.math.BigDecimal;
import java.util.List;

public record FamilyObjectiveItemDefinitionDTO(
    Long id,
    String name,
    String description,
    ObjectiveUnit unit,
    BigDecimal target,
    ObjectiveMilestone milestone,
    List<FamilyObjectiveProgressDTO> progressHistory
) {}

