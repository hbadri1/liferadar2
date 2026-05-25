export type GoalType =
  | 'PERSONAL' | 'FAMILY' | 'CAREER' | 'HEALTH' | 'FINANCIAL'
  | 'SPIRITUAL' | 'LEARNING' | 'RELATIONSHIP' | 'TRAVEL' | 'PROJECT' | 'CUSTOM';

export type GoalCategory =
  | 'LIFE_IMPROVEMENT' | 'PROJECT_DELIVERY' | 'SKILL_BUILDING' | 'HABIT_BASED'
  | 'FINANCIAL_TARGET' | 'HEALTH_TARGET' | 'RELATIONSHIP_TARGET' | 'SPIRITUAL_TARGET'
  | 'EVENT_PREPARATION' | 'OTHER';

export type GoalStatus =
  | 'DRAFT' | 'NOT_STARTED' | 'IN_PROGRESS' | 'ON_HOLD'
  | 'BLOCKED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type GoalVisibility = 'PRIVATE' | 'FAMILY_SHARED' | 'PUBLIC_SUMMARY';

export type GoalProgressMode =
  | 'MANUAL_PERCENTAGE' | 'NUMERIC_TARGET' | 'MILESTONE_BASED'
  | 'ACTION_ITEM_BASED' | 'HYBRID';

export type GoalReviewFrequency = 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'CUSTOM' | 'NONE';

export type GoalMilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'BLOCKED';

export interface IGoal {
  id: number;
  title: string;
  description?: string | null;
  goalType: GoalType;
  category?: GoalCategory | null;
  status: GoalStatus;
  priority: GoalPriority;
  visibility: GoalVisibility;
  startDate?: string | null;
  targetDate?: string | null;
  completedDate?: string | null;
  progressMode: GoalProgressMode;
  progressPercentage?: number | null;
  targetValue?: number | null;
  currentValue?: number | null;
  baselineValue?: number | null;
  unit?: string | null;
  confidenceLevel?: GoalPriority | null;
  difficultyLevel?: GoalPriority | null;
  motivation?: string | null;
  successCriteria?: string | null;
  riskNotes?: string | null;
  blockerNotes?: string | null;
  reviewFrequency?: GoalReviewFrequency | null;
  lastReviewDate?: string | null;
  nextReviewDate?: string | null;
  isArchived: boolean;
  owner?: { id: number; user?: { login?: string } } | null;
  pillar?: { id: number; code?: string } | null;
  createdDate?: string | null;
  /** Populated by backend when this goal is shared with the current user (not owned) */
  sharedWithMe?: boolean | null;
  /** True when the sharing record grants edit rights */
  canEditShared?: boolean | null;
}

export interface IGoalMilestone {
  id: number;
  title: string;
  description?: string | null;
  status: GoalMilestoneStatus;
  dueDate?: string | null;
  completedDate?: string | null;
  sortOrder?: number | null;
  progressWeight?: number | null;
  goal?: { id: number } | null;
}

export interface IGoalUpdate {
  id: number;
  updateDate: string;
  summary?: string | null;
  progressPercentage?: number | null;
  currentValue?: number | null;
  confidenceLevel?: GoalPriority | null;
  status?: GoalStatus | null;
  mood?: string | null;
  blockers?: string | null;
  nextStep?: string | null;
  createdAt?: string | null;
  createdByLogin?: string | null;
  goal?: { id: number } | null;
}

export interface IGoalDashboardSummary {
  activeGoalsCount: number;
  completedGoalsCount: number;
  atRiskGoalsCount: number;
  blockedGoalsCount: number;
  goalsDueThisMonthCount: number;
  goalsNeedingReviewCount: number;
  averageProgressPercentage: number;
  recentlyCompletedGoalsCount: number;
}

