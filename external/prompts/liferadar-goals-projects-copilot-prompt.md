# LifeRadar — Goals & Projects Module Implementation Prompt

## 1. Objective

Implement a new LifeRadar module called **Goals & Projects**.

The module allows users to define goals, break them into milestones, attach concrete action items, review progress, identify blockers, and connect goals to existing LifeRadar life pillars and family mode where available.

The main business entity must be named **Goal**.

Do not create a separate Project entity. A project is treated as a type/category of Goal.

The implementation must follow the existing LifeRadar architecture, authentication model, database conventions, REST API style, frontend UI patterns, i18n translation structure, and ownership/security model.

---

## 2. Business Purpose

LifeRadar already helps users define life pillars, evaluate life areas, create action items, manage family context, control expenses, and plan trips.

The **Goals & Projects** module should answer this user need:

> I know what area of life I want to improve. Now I need to define a clear goal, break it into milestones, attach concrete actions, track progress, review it periodically, and understand whether I am on track.

Examples of goals:

- Lose 8 kg
- Save 30,000 SAR
- Launch LifeRadar MVP
- Prepare for AWS certification
- Improve Quran memorization
- Improve relationship with family
- Complete a professional course
- Prepare for a family trip
- Build LifeRadar mobile app
- Reduce monthly expenses

---

## 3. Core Business Concepts

| Concept | Meaning |
|---|---|
| Goal | Desired outcome or project objective |
| Goal Milestone | Major checkpoint inside a goal |
| Goal Update | Review/history entry for a goal |
| Action Item | Concrete executable task supporting a goal |
| Life Pillar | Life domain connected to the goal |
| Family Member | Optional goal owner in Family Mode |

Example:

**Goal:** Launch LifeRadar MVP

**Milestones:**

- Finalize core features
- Publish premium page
- Create social media accounts
- Collect feedback from first users

**Action Items:**

- Write first LinkedIn post
- Fix dashboard bug
- Add pricing disclaimer

**Goal Updates:**

- This week I completed the premium page and created the X account.
- Marketing is still weak, so I need to post more consistently.

---

## 4. Main Entities

Implement these main entities:

1. **Goal**
2. **GoalMilestone**
3. **GoalUpdate**

Also add optional relationships to existing LifeRadar entities where they already exist:

- Pillar
- ActionItem
- FamilyMember
- LifeEvaluation, optional and can be deferred

Do not break existing functionality.

---

## 5. Entity: Goal

### Purpose

`Goal` is the main entity. It represents a medium-term or long-term objective the user wants to achieve.

A Goal can be personal, family-related, professional, health-related, financial, spiritual, educational, relationship-based, travel-related, or project-based.

A project is not a separate entity. It is represented as a Goal with suitable type/category values.

---

### Goal Attributes

| Attribute | Type / Expected Value | Required | Purpose |
|---|---:|---:|---|
| id | Identifier | Yes | Unique technical identifier |
| title | Text | Yes | Short name of the goal |
| description | Long text | No | Detailed description |
| goalType | Enum | Yes | Life domain of the goal |
| category | Enum | No | Nature of the goal |
| status | Enum | Yes | Current goal status |
| priority | Enum | Yes | Importance level |
| visibility | Enum | Yes | Privacy/family visibility |
| startDate | Date | No | When the goal starts |
| targetDate | Date | No | Target completion date |
| completedDate | Date | No | Actual completion date |
| progressMode | Enum | Yes | How progress is calculated |
| progressPercentage | Number 0–100 | No | Current progress percentage |
| targetValue | Decimal | No | Numeric target value |
| currentValue | Decimal | No | Current numeric value |
| baselineValue | Decimal | No | Starting value |
| unit | Text | No | Unit such as kg, SAR, pages, hours |
| confidenceLevel | Enum | No | User confidence in achieving goal |
| difficultyLevel | Enum | No | Perceived difficulty |
| motivation | Long text | No | Why this goal matters |
| successCriteria | Long text | No | Definition of done |
| riskNotes | Long text | No | Known risks |
| blockerNotes | Long text | No | Current blockers |
| reviewFrequency | Enum | No | How often the goal should be reviewed |
| lastReviewDate | Date | No | Last review date |
| nextReviewDate | Date | No | Next planned review date |
| isArchived | Boolean | Yes | Whether hidden from active views |
| createdAt | Timestamp | Yes | Creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |
| createdBy | User reference / username | Yes | Owner/audit field |
| updatedBy | User reference / username | No | Last updater/audit field |

---

### Goal Field Rules

#### title

Required short name of the goal.

Examples:

- Lose 8 kg
- Save 30,000 SAR
- Launch LifeRadar MVP
- Prepare for IBM interview

Validation:

- Required
- Minimum length: 2
- Maximum length: 150

#### description

Optional detailed description.

#### motivation

Explains why the goal matters.

Example:

> I want to improve my health, energy, and confidence.

#### successCriteria

Defines when the goal is considered successfully completed.

Example:

> Reach 78 kg and maintain it for 30 days.

#### riskNotes

Known risks that may prevent success.

Example:

> Lack of consistency during workdays.

#### blockerNotes

Current blockers.

Example:

> No fixed time slot reserved for exercise.

---

## 6. Goal Enums

### GoalType

Represents the life domain.

Allowed values:

- PERSONAL
- FAMILY
- CAREER
- HEALTH
- FINANCIAL
- SPIRITUAL
- LEARNING
- RELATIONSHIP
- TRAVEL
- PROJECT
- CUSTOM

Examples:

| Goal | GoalType |
|---|---|
| Lose 8 kg | HEALTH |
| Save 30,000 SAR | FINANCIAL |
| Launch LifeRadar MVP | PROJECT |
| Improve Quran memorization | SPIRITUAL |
| Prepare for AWS certification | LEARNING |

---

### GoalCategory

Represents the nature of the goal.

Allowed values:

- LIFE_IMPROVEMENT
- PROJECT_DELIVERY
- SKILL_BUILDING
- HABIT_BASED
- FINANCIAL_TARGET
- HEALTH_TARGET
- RELATIONSHIP_TARGET
- SPIRITUAL_TARGET
- EVENT_PREPARATION
- OTHER

Difference between type and category:

| Field | Meaning |
|---|---|
| goalType | Area of life |
| category | Kind of objective |

Example:

| Field | Value |
|---|---|
| title | Improve AWS architecture skills |
| goalType | CAREER |
| category | SKILL_BUILDING |

---

### GoalStatus

Allowed values:

- DRAFT
- NOT_STARTED
- IN_PROGRESS
- ON_HOLD
- BLOCKED
- AT_RISK
- COMPLETED
- CANCELLED
- ARCHIVED

Meanings:

| Status | Meaning |
|---|---|
| DRAFT | Created but not activated |
| NOT_STARTED | Planned but not started |
| IN_PROGRESS | Actively being worked on |
| ON_HOLD | Temporarily paused |
| BLOCKED | Cannot continue because of blocker |
| AT_RISK | Progress, date, or blockers indicate risk |
| COMPLETED | Achieved |
| CANCELLED | Intentionally stopped |
| ARCHIVED | Hidden from active views |

---

### GoalPriority

Allowed values:

- LOW
- MEDIUM
- HIGH
- CRITICAL

Use priority for dashboard sorting, filtering, and highlighting important goals.

---

### GoalVisibility

Allowed values:

- PRIVATE
- FAMILY_SHARED
- PUBLIC_SUMMARY

Meanings:

| Visibility | Meaning |
|---|---|
| PRIVATE | Visible only to the goal owner |
| FAMILY_SHARED | Visible in Family Mode according to permissions |
| PUBLIC_SUMMARY | Reserved for future use |

For MVP, implement PRIVATE and FAMILY_SHARED. Keep PUBLIC_SUMMARY as an enum value, but do not expose public sharing yet.

---

### GoalProgressMode

Allowed values:

- MANUAL_PERCENTAGE
- NUMERIC_TARGET
- MILESTONE_BASED
- ACTION_ITEM_BASED
- HYBRID

Meanings:

| Progress Mode | Meaning |
|---|---|
| MANUAL_PERCENTAGE | User manually enters progress percentage |
| NUMERIC_TARGET | Progress calculated from currentValue, targetValue, and optional baselineValue |
| MILESTONE_BASED | Progress calculated from completed milestones |
| ACTION_ITEM_BASED | Progress calculated from completed action items |
| HYBRID | Reserved for future weighted calculation |

For MVP, HYBRID should behave like MANUAL_PERCENTAGE.

---

### GoalDifficultyLevel

Allowed values:

- EASY
- MEDIUM
- HARD
- VERY_HARD

---

### GoalConfidenceLevel

Allowed values:

- LOW
- MEDIUM
- HIGH
- VERY_HIGH

---

### GoalReviewFrequency

Allowed values:

- DAILY
- WEEKLY
- BI_WEEKLY
- MONTHLY
- QUARTERLY
- CUSTOM
- NONE

---

## 7. Entity: GoalMilestone

### Purpose

`GoalMilestone` represents a major checkpoint inside a goal.

A milestone is not a small task. It is a meaningful stage of progress.

Example:

**Goal:** Prepare for AWS certification

**Milestones:**

1. Finish AWS course
2. Complete 3 practice exams
3. Review weak areas
4. Book exam
5. Pass exam

---

### GoalMilestone Attributes

| Attribute | Type / Expected Value | Required | Purpose |
|---|---:|---:|---|
| id | Identifier | Yes | Unique technical identifier |
| goal | Goal reference | Yes | Parent goal |
| title | Text | Yes | Milestone title |
| description | Long text | No | Milestone details |
| status | Enum | Yes | Milestone status |
| dueDate | Date | No | Planned due date |
| completedDate | Date | No | Completion date |
| sortOrder | Number | No | Display order |
| progressWeight | Number 0–100 | No | Future weighted progress support |
| createdAt | Timestamp | Yes | Creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |

---

### GoalMilestoneStatus

Allowed values:

- NOT_STARTED
- IN_PROGRESS
- COMPLETED
- SKIPPED
- BLOCKED

---

### GoalMilestone Business Rules

- Each milestone belongs to one Goal.
- A Goal can have many milestones.
- Milestones should be ordered by `sortOrder`.
- A milestone can be marked as completed.
- When a milestone is completed, set `completedDate`.
- If `progressMode = MILESTONE_BASED`, changing milestone status should recalculate Goal progress.
- `progressWeight` is optional for now.
- For MVP, milestone-based progress is calculated as: completed milestones / total milestones.

---

## 8. Entity: GoalUpdate

### Purpose

`GoalUpdate` is a review/history entry for a goal.

Each time the user reviews a goal, create a GoalUpdate.

It stores what changed, current progress, confidence level, blockers, and next step.

---

### GoalUpdate Attributes

| Attribute | Type / Expected Value | Required | Purpose |
|---|---:|---:|---|
| id | Identifier | Yes | Unique technical identifier |
| goal | Goal reference | Yes | Parent goal |
| updateDate | Date | Yes | Review/update date |
| summary | Long text | No | What happened since last review |
| progressPercentage | Number 0–100 | No | Progress at review time |
| currentValue | Decimal | No | Current numeric value at review time |
| confidenceLevel | Enum | No | Confidence at review time |
| status | Enum | No | Status at review time |
| mood | Text | No | Optional emotional/mood indicator |
| blockers | Long text | No | Blockers noted during review |
| nextStep | Long text | No | Next action or focus |
| createdAt | Timestamp | Yes | Creation timestamp |
| createdBy | User reference / username | Yes | Creator/audit field |

---

### GoalUpdate Example

**Goal:** Launch LifeRadar MVP

| Field | Value |
|---|---|
| summary | Published premium page and created X account. |
| progressPercentage | 45 |
| confidenceLevel | MEDIUM |
| status | IN_PROGRESS |
| mood | MOTIVATED |
| blockers | Need more time for marketing. |
| nextStep | Write 5 LinkedIn posts this week. |

---

### GoalUpdate Business Rules

- Each update belongs to one Goal.
- Creating an update should update the main Goal fields when applicable.
- Creating an update should update `lastReviewDate` and `nextReviewDate`.
- GoalUpdate is used as the historical review log for the Goal.
- Do not create a separate metric/snapshot entity.
- If charts are needed later, derive simple history from GoalUpdate records.

---

## 9. Relationships with Existing LifeRadar Entities

### Goal to Pillar

A Goal may belong to one Life Pillar.

Relationship:

- Many Goals to one Pillar

Example:

| Goal | Pillar |
|---|---|
| Lose 8 kg | Health |
| Prepare for AWS certification | Career |
| Improve Quran memorization | Spirituality |

Rules:

- The relation is optional.
- A Goal can exist without a Pillar.
- Goals linked to Pillars can be shown inside Pillar details and dashboards.

---

### Goal to ActionItem

A Goal can have many Action Items.

Relationship:

- One Goal to many ActionItems

Rules:

- An ActionItem may exist without a Goal.
- A Goal may have zero or many ActionItems.
- If `progressMode = ACTION_ITEM_BASED`, completed ActionItems should be used to calculate progress.
- Goal details should show linked Action Items.
- From Goal details, user should be able to create an Action Item already linked to the Goal.

Example:

**Goal:** Launch LifeRadar MVP

**Action Items:**

- Create premium page
- Add payment placeholder
- Create X account
- Write first 10 posts

---

### Goal to FamilyMember

If Family Mode exists, a Goal may have an owner member.

Relationship:

- Many Goals to one FamilyMember

Examples:

| Goal | Owner Member |
|---|---|
| Improve child math score | Child |
| Save for family vacation | Family Admin / Parent |
| Complete Quran memorization plan | Specific family member |

Rules:

- `ownerMember` is optional.
- If `visibility = FAMILY_SHARED`, the Goal can appear in family views.
- Respect the existing Family Mode permission model.
- Do not expose private goals to family members unless visibility allows it.

---

### Goal to LifeEvaluation

Optional relationship and can be deferred.

A Life Evaluation may reference a Goal.

Example:

> Career score is 3/5 because the AWS certification goal is behind schedule.

For MVP, this relation can be deferred unless the existing LifeEvaluation model is easy to extend.

---

## 10. Progress Calculation

Implement a backend progress calculation service or equivalent business logic.

Required capabilities:

- Calculate progress for a Goal.
- Recalculate progress for a Goal by ID.
- Calculate numeric progress.
- Calculate milestone-based progress.
- Calculate action-item-based progress.
- Clamp progress between 0 and 100.

---

### Progress Rules

#### MANUAL_PERCENTAGE

Use the value entered by the user.

Example:

| Field | Value |
|---|---:|
| progressPercentage | 40 |

---

#### NUMERIC_TARGET

Calculate progress using current value, target value, and optional baseline value.

Basic formula when baseline is not provided:

> progress = currentValue / targetValue × 100

Formula when baseline is provided:

> progress = distance moved from baseline toward target / total distance from baseline to target × 100

This must handle both increasing and decreasing goals.

Example 1 — saving money:

| Field | Value |
|---|---:|
| targetValue | 30,000 SAR |
| currentValue | 12,000 SAR |
| progress | 40% |

Example 2 — weight loss:

| Field | Value |
|---|---:|
| baselineValue | 90 kg |
| targetValue | 80 kg |
| currentValue | 85 kg |
| progress | 50% |

Important:

- Handle goals where the target is lower than the baseline, such as weight loss or debt reduction.
- Avoid division by zero.
- If target data is invalid, return 0 or keep the existing manual value based on current implementation style.

---

#### MILESTONE_BASED

For MVP:

> progress = completed milestones / total milestones × 100

If there are no milestones:

> progress = 0

---

#### ACTION_ITEM_BASED

For MVP:

> progress = completed action items / total action items × 100

If there are no action items:

> progress = 0

---

#### HYBRID

For MVP:

> Treat HYBRID as MANUAL_PERCENTAGE.

Later, HYBRID may combine manual percentage, milestone weights, action item completion, and numeric target progress.

---

### Progress Boundaries

Always clamp progress:

- Minimum: 0
- Maximum: 100

---

### Completion Rule

When progress reaches 100:

- Set `status = COMPLETED`.
- Set `completedDate = today` if `completedDate` is empty.

Do not automatically complete the goal if current status is:

- CANCELLED
- ARCHIVED

---

## 11. Goal Review Logic

Create a goal review feature.

The user can review a goal from the Goal Details page.

### Review Form Fields

| Field | Required | Purpose |
|---|---:|---|
| reviewDate | Yes | Date of review |
| summary | No | What changed since last review |
| progressPercentage | No | Updated manual progress |
| currentValue | No | Updated numeric value |
| confidenceLevel | No | Updated confidence |
| status | No | Updated status |
| mood | No | Optional mood text |
| blockers | No | Current blockers |
| nextStep | No | Next action or focus |

---

### On Submit

When the user submits a review:

1. Create a GoalUpdate record.
2. Update applicable Goal fields.
3. Recalculate progress if needed.
4. Update `lastReviewDate`.
5. Calculate and update `nextReviewDate`.
6. Refresh the Goal Details page.

---

### Next Review Date Calculation

Rules:

| Review Frequency | Next Review Date |
|---|---|
| DAILY | lastReviewDate + 1 day |
| WEEKLY | lastReviewDate + 1 week |
| BI_WEEKLY | lastReviewDate + 2 weeks |
| MONTHLY | lastReviewDate + 1 month |
| QUARTERLY | lastReviewDate + 3 months |
| CUSTOM | Keep existing nextReviewDate for now |
| NONE | null |

---

## 12. At-Risk Logic

Create logic to identify goals at risk.

A Goal is considered at risk if any of the following is true:

- `targetDate` has passed and status is not COMPLETED or CANCELLED.
- `targetDate` is within 7 days and `progressPercentage < 80`.
- `status = BLOCKED`.
- `confidenceLevel = LOW` and status is IN_PROGRESS.

For MVP:

- Do not automatically change status to AT_RISK in all cases.
- Show warning badges and dashboard alerts.
- Only change status to AT_RISK when explicitly recalculating risk, or when current status is IN_PROGRESS and the implementation already supports this cleanly.

---

## 13. Dashboard Summary

Add a Goals & Projects summary to the LifeRadar dashboard.

### Dashboard Summary Fields

| Field | Meaning |
|---|---|
| activeGoalsCount | Count of active goals |
| completedGoalsCount | Count of completed goals |
| atRiskGoalsCount | Count of at-risk goals |
| blockedGoalsCount | Count of blocked goals |
| goalsDueThisMonthCount | Goals with target date this month |
| goalsNeedingReviewCount | Goals where nextReviewDate <= today |
| averageProgressPercentage | Average progress across active goals |
| recentlyCompletedGoalsCount | Goals completed recently |

---

### Dashboard Cards

Add cards for:

- Active Goals
- Goals Needing Review
- At-Risk Goals
- Due This Month
- Recently Completed Goals
- Average Progress

Also show short lists:

- Top Priority Goals
- Goals Needing Review
- At-Risk Goals
- Recently Completed Goals

---

## 14. Required Frontend Screens

### Screen 1: Goals List

Route:

- `/goals`

Purpose:

Show all active goals.

Display each goal as a card or table row with:

- Title
- Goal type
- Category
- Status
- Priority
- Progress percentage
- Target date
- Next review date
- Linked pillar
- Owner member, if applicable

Filters:

- Status
- Goal type
- Category
- Priority
- Pillar
- Owner member
- Archived / active

Sorting:

- Target date ascending
- Priority descending
- Progress percentage ascending
- Created date descending

Actions:

- Create Goal
- Open Goal Details
- Edit Goal
- Archive Goal
- Mark Complete
- Review Goal

---

### Screen 2: Create/Edit Goal

Routes:

- `/goals/new`
- `/goals/:id/edit`

Fields:

- title
- description
- goalType
- category
- status
- priority
- visibility
- pillar
- ownerMember
- startDate
- targetDate
- progressMode
- progressPercentage
- baselineValue
- targetValue
- currentValue
- unit
- confidenceLevel
- difficultyLevel
- motivation
- successCriteria
- riskNotes
- blockerNotes
- reviewFrequency
- nextReviewDate

Default values:

| Field | Default |
|---|---|
| status | DRAFT |
| priority | MEDIUM |
| visibility | PRIVATE |
| progressMode | MANUAL_PERCENTAGE |
| progressPercentage | 0 |
| isArchived | false |
| reviewFrequency | WEEKLY |

Validation:

- title is required.
- goalType is required.
- status is required.
- priority is required.
- visibility is required.
- progressMode is required.
- targetDate must be after or equal to startDate.
- progressPercentage must be between 0 and 100.
- targetValue cannot be negative.
- currentValue cannot be negative.
- baselineValue cannot be negative unless the use case allows it.

---

### Screen 3: Goal Details

Route:

- `/goals/:id`

Sections:

- Goal Overview
- Progress
- Milestones
- Action Items
- Updates / Reviews
- Risks & Blockers
- Linked Pillar

Summary cards:

- Status
- Progress percentage
- Days remaining
- Priority
- Confidence
- Difficulty
- Next review date

Actions:

- Edit Goal
- Review Goal
- Add Milestone
- Add Action Item
- Recalculate Progress
- Archive Goal
- Mark Complete
- Cancel Goal

---

### Screen 4: Milestone Management

Inside Goal Details.

Features:

- Add milestone
- Edit milestone
- Delete milestone
- Mark milestone complete
- Mark milestone blocked
- Reorder milestones

Milestone fields:

- title
- description
- status
- dueDate
- progressWeight
- sortOrder

---

### Screen 5: Goal Review Modal

Fields:

- reviewDate
- summary
- progressPercentage
- currentValue
- confidenceLevel
- status
- mood
- blockers
- nextStep

On submit:

- Create GoalUpdate.
- Update Goal.
- Recalculate progress.
- Recalculate nextReviewDate.
- Refresh Goal Details.

---

### Screen 6: Goal Dashboard Widget

Add to main dashboard.

Show:

- Active goals count
- At-risk goals count
- Goals needing review
- Goals due this month
- Average progress

Also show short list:

- Top 3 priority goals
- Top 3 goals needing review

---

## 15. API Endpoints

### Goal Endpoints

- `GET /api/goals`
- `GET /api/goals/{id}`
- `POST /api/goals`
- `PUT /api/goals/{id}`
- `PATCH /api/goals/{id}`
- `DELETE /api/goals/{id}`

Additional business endpoints:

- `GET /api/goals/dashboard-summary`
- `GET /api/goals/needs-review`
- `GET /api/goals/at-risk`
- `GET /api/goals/due-this-month`
- `POST /api/goals/{id}/review`
- `POST /api/goals/{id}/recalculate-progress`
- `POST /api/goals/{id}/archive`
- `POST /api/goals/{id}/complete`
- `POST /api/goals/{id}/cancel`

---

### GoalMilestone Endpoints

- `GET /api/goals/{goalId}/milestones`
- `POST /api/goals/{goalId}/milestones`
- `PUT /api/goal-milestones/{id}`
- `PATCH /api/goal-milestones/{id}`
- `DELETE /api/goal-milestones/{id}`
- `POST /api/goal-milestones/{id}/complete`
- `POST /api/goal-milestones/{id}/block`
- `POST /api/goal-milestones/{id}/reorder`

---

### GoalUpdate Endpoints

- `GET /api/goals/{goalId}/updates`
- `POST /api/goals/{goalId}/updates`

Prefer using `POST /api/goals/{id}/review` for the normal user review flow.

---

## 16. Backend Services / Business Components

Create or update business components for:

- Goal management
- Goal milestone management
- Goal update/review management
- Goal progress calculation
- Goal dashboard summary
- Goal risk detection
- Goal review flow

Important capabilities:

- Create Goal
- Update Goal
- Review Goal
- Recalculate Goal progress
- Archive Goal
- Complete Goal
- Cancel Goal
- Find Goals needing review
- Find at-risk Goals
- Find Goals due this month
- Get dashboard summary

---

## 17. DTOs / API Contracts

Create API contracts for:

- GoalDTO
- GoalMilestoneDTO
- GoalUpdateDTO
- GoalReviewDTO
- GoalDashboardSummaryDTO
- GoalRiskDTO

### GoalReviewDTO Fields

- goalId
- reviewDate
- summary
- progressPercentage
- currentValue
- confidenceLevel
- status
- mood
- blockers
- nextStep

### GoalDashboardSummaryDTO Fields

- activeGoalsCount
- completedGoalsCount
- atRiskGoalsCount
- blockedGoalsCount
- goalsDueThisMonthCount
- goalsNeedingReviewCount
- averageProgressPercentage
- recentlyCompletedGoalsCount

### GoalRiskDTO Fields

- goalId
- title
- status
- priority
- targetDate
- progressPercentage
- confidenceLevel
- riskReason
- daysRemaining

---

## 18. Database and Indexing

Add indexes for common queries:

- createdBy
- status
- goalType
- category
- priority
- targetDate
- nextReviewDate
- pillarId
- ownerMemberId
- isArchived
- visibility

Important queries:

- Find active goals for current user.
- Find archived goals.
- Find goals by pillar.
- Find goals by family member.
- Find goals needing review.
- Find goals due this month.
- Find at-risk goals.
- Find completed goals this year.
- Find goals by status and priority.

---

## 19. Security and Ownership Rules

Respect the existing LifeRadar user ownership model.

Rules:

- A user can only see their own private goals.
- A user can only edit goals they own or are allowed to manage.
- Family-shared goals must respect the existing Family Mode permission model.
- Private goals must not appear in family dashboards.
- Archived goals must not appear in active lists unless explicitly requested.

For MVP:

- Use `createdBy = current authenticated user`.
- Filter all private goal queries by current user.
- Add family visibility only if the current Family Mode model supports it safely.

---

## 20. Business Rules Summary

Implement these rules:

- A Goal must have title, goalType, status, priority, visibility, and progressMode.
- A Goal can exist without milestones.
- A Goal can exist without action items.
- A Goal can be linked to a Pillar, but this is optional.
- A Goal can be linked to a FamilyMember, but this is optional.
- A completed Goal should have completedDate.
- An archived Goal should not appear in active lists by default.
- A blocked Goal should appear in dashboard alerts.
- A Goal with `nextReviewDate <= today` should appear in Goals Needing Review.
- A Goal with targetDate in the next 7 days and progress below 80% should appear as At Risk.
- A Goal with targetDate passed and not completed/cancelled should appear as At Risk.
- When a GoalUpdate is created, update the Goal review fields.
- When milestone status changes and `progressMode = MILESTONE_BASED`, recalculate progress.
- When ActionItem status changes and `progressMode = ACTION_ITEM_BASED`, recalculate progress if integration is feasible.

---

## 21. UX Requirements

Use a clean LifeRadar-style UI.

Goal cards should show:

- Title
- Type badge
- Category badge
- Status badge
- Priority badge
- Progress bar
- Target date
- Next review date
- Linked pillar
- Owner member, if applicable

Example card:

**Launch LifeRadar MVP**  
PROJECT · PROJECT_DELIVERY · HIGH · IN_PROGRESS  
Progress: 45%  
Target: 30 June 2026  
Next Review: 29 May 2026  
Pillar: Career / Business

Use clear badge colors for:

- Status
- Priority
- Risk
- Completion

Use a progress bar for `progressPercentage`.

Empty states:

- No goals yet. Create your first goal to start turning life evaluations into progress.
- No milestones yet. Add milestones to break this goal into clear checkpoints.
- No updates yet. Review this goal to start tracking your progress history.

---

## 22. i18n / Translation

Add translation keys for all labels, enums, buttons, validation messages, and empty states.

Support the existing app languages.

### English Labels

- Goals & Projects
- Goal
- Goals
- Create Goal
- Edit Goal
- Review Goal
- Milestones
- Goal Updates
- Progress History
- At Risk
- Needs Review
- Due This Month
- Archive Goal
- Complete Goal
- Cancel Goal

### Arabic Labels

- الأهداف والمشاريع
- هدف
- الأهداف
- إنشاء هدف
- تعديل الهدف
- مراجعة الهدف
- المراحل
- تحديثات الهدف
- سجل التقدم
- معرّض للخطر
- يحتاج مراجعة
- مستحق هذا الشهر
- أرشفة الهدف
- إكمال الهدف
- إلغاء الهدف

### French Labels

- Objectifs et projets
- Objectif
- Objectifs
- Créer un objectif
- Modifier l’objectif
- Revoir l’objectif
- Jalons
- Mises à jour de l’objectif
- Historique de progression
- À risque
- À revoir
- À échéance ce mois-ci
- Archiver l’objectif
- Terminer l’objectif
- Annuler l’objectif

---

## 23. Suggested Data Model Summary

### Goal

Fields:

- title
- description
- goalType
- category
- status
- priority
- visibility
- startDate
- targetDate
- completedDate
- progressMode
- progressPercentage
- targetValue
- currentValue
- baselineValue
- unit
- confidenceLevel
- difficultyLevel
- motivation
- successCriteria
- riskNotes
- blockerNotes
- reviewFrequency
- lastReviewDate
- nextReviewDate
- isArchived
- createdAt
- updatedAt
- createdBy
- updatedBy

Relationships:

- Optional many-to-one to Pillar
- Optional many-to-one to FamilyMember
- One-to-many to GoalMilestone
- One-to-many to GoalUpdate
- Optional one-to-many relationship from Goal to ActionItem if existing ActionItem supports it

---

### GoalMilestone

Fields:

- goal
- title
- description
- status
- dueDate
- completedDate
- sortOrder
- progressWeight
- createdAt
- updatedAt

Relationship:

- Required many-to-one to Goal

---

### GoalUpdate

Fields:

- goal
- updateDate
- summary
- progressPercentage
- currentValue
- confidenceLevel
- status
- mood
- blockers
- nextStep
- createdAt
- createdBy

Relationship:

- Required many-to-one to Goal

---

## 24. MVP Scope

Implement first:

- Goal entity
- GoalMilestone entity
- GoalUpdate entity
- Goal list page
- Goal create/edit page
- Goal details page
- Milestone management
- Goal review modal
- Progress calculation
- Dashboard summary
- Link Goal to Pillar
- Optional link Goal to ActionItem
- Basic ownership/security filtering
- i18n labels

Defer:

- AI goal suggestions
- Advanced hybrid progress weighting
- Public goal sharing
- Complex family permission workflows
- Advanced analytics
- Habit integration
- Calendar sync
- External reminders

---

## 25. Final Implementation Instruction

Start with the backend model and database migration, then implement business services and REST APIs, then implement the frontend screens.

Use the existing project style.

Do not create unnecessary abstractions.

Do not create a separate Project entity.

Use Goal as the main entity for both goals and projects.

Do not implement a separate metric/snapshot entity.

Make the first implementation stable, simple, and useful.
