package com.atharsense.lr.service.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record FamilyObjectiveProgressDTO(Long id, Instant createdAt, BigDecimal value, String notes) {}

