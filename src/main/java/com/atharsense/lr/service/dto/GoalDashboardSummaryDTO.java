package com.atharsense.lr.service.dto;

public record GoalDashboardSummaryDTO(
    long activeGoalsCount,
    long completedGoalsCount,
    long atRiskGoalsCount,
    long blockedGoalsCount,
    long goalsDueThisMonthCount,
    long goalsNeedingReviewCount,
    double averageProgressPercentage,
    long recentlyCompletedGoalsCount
) {}

