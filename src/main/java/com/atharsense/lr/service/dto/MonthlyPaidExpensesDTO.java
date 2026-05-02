package com.atharsense.lr.service.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MonthlyPaidExpensesDTO(BigDecimal totalPaidSar, String timezone, LocalDate monthStart, LocalDate monthEnd) {}

