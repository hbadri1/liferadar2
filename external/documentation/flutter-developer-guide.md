# Flutter Developer Guide

This document describes the mobile app feature scope and implementation guidance for a Flutter developer.

## 1. Features (Overview)

- Build a feature-first Flutter app with clear modules: `trips`, `finances`, `family`, `decision`, `settings`.
- Keep business logic in services/use-cases and UI in screens/widgets.
- Support offline-first usage for key data views (especially trips and finances).
- Use localization, analytics events, and robust error handling across all modules.
- Support exactly 3 app languages aligned with the current project: `en`, `fr`, `ar-ly`.

### Recommended Flutter Stack

- **State management:** Riverpod (or Bloc if team standard already exists)
- **Navigation:** `go_router`
- **Networking:** `dio`
- **Persistence:** `isar` or `sqflite`
- **Serialization:** `json_serializable`
- **Design system:** reusable theme + component library

---

## 2. Trips Module

### Core Goals

- Create, edit, and archive trips.
- Track destination, dates, members, itinerary, checklist, and notes.
- Show upcoming trips and recent history.

### Suggested Data Model

- `Trip`: `id`, `title`, `destination`, `startDate`, `endDate`, `status`
- `TripMember`: `userId`, `role`
- `TripEvent`: `dateTime`, `title`, `location`, `description`
- `TripChecklistItem`: `label`, `isDone`, `assignedTo`

### UI Screens

- Trips list (active + archived)
- Trip details
- Itinerary timeline
- Packing/checklist view

### Developer Notes

- Add date conflict validation.
- Cache trip details for quick reopen.
- Support deep links to a specific trip.

---

## 3. Finances Module

### Core Goals

- Track budgets, expenses, categories, and shared costs.
- Provide per-trip and global finance summaries.
- Add simple forecasting (remaining budget).

### Suggested Data Model

- `Budget`: `id`, `name`, `limitAmount`, `currency`, `period`
- `Expense`: `id`, `title`, `amount`, `category`, `date`, `tripId`, `paidBy`
- `Split`: `expenseId`, `userId`, `shareAmount`, `status`

### UI Screens

- Budget overview
- Expense list + filter by category/date
- Add/edit expense
- Split settlement summary

### Developer Notes

- Use decimal-safe amounts (avoid binary floating point for totals).
- Validate currency consistency at entry time.
- Consider CSV export for reports.

---

## 4. Family Module

### Core Goals

- Manage household members and relationships.
- Set member profiles, preferences, constraints, and roles.
- Enable shared visibility for trips and financial responsibilities.

### Suggested Data Model

- `FamilyMember`: `id`, `name`, `avatarUrl`, `role`, `birthDate`
- `Preference`: `memberId`, `type`, `value`
- `Constraint`: `memberId`, `type` (diet, mobility, schedule), `value`

### UI Screens

- Family members list
- Member profile/details
- Preferences and constraints editor

### Developer Notes

- Add role-based visibility for sensitive data.
- Keep profile data sync-safe for offline edits.
- Support soft delete/recovery.

---

## 5. Decision Module

### Core Goals

- Help families decide between options (destinations, plans, purchases).
- Collect votes, weighted preferences, and rationale.
- Present transparent recommendation output.

### Suggested Data Model

- `Decision`: `id`, `title`, `description`, `status`, `deadline`
- `Option`: `id`, `decisionId`, `label`, `metadata`
- `Vote`: `decisionId`, `optionId`, `memberId`, `weight`
- `DecisionResult`: `decisionId`, `selectedOptionId`, `scoreBreakdown`

### UI Screens

- Decision list
- Decision details with options
- Voting screen
- Result screen with explanation

### Developer Notes

- Prevent duplicate votes unless revote is allowed.
- Keep an audit log for final decision changes.
- Expose score explanation to increase trust.

---

## 6. Settings Module

### Core Goals

- Manage account preferences and app behavior.
- Control notifications, privacy, language, and theme.
- Provide data backup/sync and account/session controls.

### Suggested Sections

- Profile and account
- Notifications
- Privacy and permissions
- Language and regional settings
- Theme (light/dark/system)
- Data sync/backup
- Sign out / delete account

### Developer Notes

- Persist settings locally and sync to backend when authenticated.
- Apply theme and locale without app restart.
- Guard destructive actions with confirmation dialogs.
- Make language selection explicit in settings and restrict to `en`, `fr`, `ar-ly`.

---

## Cross-Cutting Technical Guidelines

### Architecture

- Prefer clean boundaries:
  - `presentation/` (widgets, screens)
  - `application/` (use-cases)
  - `domain/` (entities, contracts)
  - `data/` (DTOs, repositories)

### Quality

- Unit tests for use-cases and mappers.
- Widget tests for critical flows.
- Integration tests for create/edit/sync scenarios.
- Add localization tests to verify key screens render in `en`, `fr`, and `ar-ly`.

### Performance

- Paginate list-heavy screens.
- Use background parsing for large payloads.
- Minimize rebuilds with granular providers/selectors.

### Security

- Store sensitive tokens in secure storage.
- Encrypt local sensitive financial data if required by policy.
- Validate all user input before API submission.

---

## Suggested Delivery Milestones

1. Foundation: routing, auth, theming, localization, base architecture.
2. Trips + Family MVP.
3. Finances MVP with summaries.
4. Decision workflows.
5. Settings completion, QA hardening, and release prep.

## Definition of Done (Per Module)

- Functional UI implemented.
- Domain/use-case logic covered by tests.
- API and offline sync behavior verified.
- Analytics and error states added.
- Localization keys and accessibility checks completed for `en`, `fr`, and `ar-ly`.

---

## API List by Feature (Suggested Contract)

> Use this as a baseline API map for Flutter integration. Adjust naming and payloads to match your backend conventions.

### Features (Shared/Core)

- `POST /api/authenticate` - Sign in and get auth tokens.
- `POST /api/logout` - Revoke current session/token.
- `GET /api/account` - Fetch current user profile and roles.
- `GET /api/features` - Fetch enabled feature flags for the user.
- `GET /api/notifications` - List user notifications.

### Trips

- `GET /api/trips` - List trips (supports status/date filters).
- `POST /api/trips` - Create a trip.
- `GET /api/trips/{tripId}` - Get trip details.
- `PUT /api/trips/{tripId}` - Update trip metadata.
- `DELETE /api/trips/{tripId}` - Archive/delete trip.
- `GET /api/trips/{tripId}/itinerary` - Get trip events/timeline.
- `POST /api/trips/{tripId}/itinerary` - Add itinerary event.
- `GET /api/trips/{tripId}/checklist` - List checklist items.
- `POST /api/trips/{tripId}/checklist` - Add checklist item.
- `PATCH /api/trips/{tripId}/checklist/{itemId}` - Mark checklist item done/undone.
- `POST /api/trips/{tripId}/members` - Add member to trip.
- `DELETE /api/trips/{tripId}/members/{memberId}` - Remove member from trip.

### Finances

- `GET /api/finances/budgets` - List budgets.
- `POST /api/finances/budgets` - Create budget.
- `PUT /api/finances/budgets/{budgetId}` - Update budget.
- `GET /api/finances/expenses` - List expenses (supports trip/category/date filters).
- `POST /api/finances/expenses` - Create expense.
- `PUT /api/finances/expenses/{expenseId}` - Update expense.
- `DELETE /api/finances/expenses/{expenseId}` - Delete expense.
- `GET /api/finances/splits/{expenseId}` - Get split details.
- `POST /api/finances/splits/{expenseId}/settle` - Mark split share as settled.
- `GET /api/finances/summary` - Get totals and remaining budget.

### Family

- `GET /api/family/members` - List family members.
- `POST /api/family/members` - Create/add family member.
- `GET /api/family/members/{memberId}` - Get member profile.
- `PUT /api/family/members/{memberId}` - Update member profile.
- `DELETE /api/family/members/{memberId}` - Soft delete member.
- `GET /api/family/members/{memberId}/preferences` - List member preferences.
- `PUT /api/family/members/{memberId}/preferences` - Replace/update preferences.
- `GET /api/family/members/{memberId}/constraints` - List constraints.
- `PUT /api/family/members/{memberId}/constraints` - Replace/update constraints.

### Decision

- `GET /api/decisions` - List decisions.
- `POST /api/decisions` - Create decision.
- `GET /api/decisions/{decisionId}` - Get decision details.
- `PUT /api/decisions/{decisionId}` - Update decision metadata.
- `POST /api/decisions/{decisionId}/options` - Add decision option.
- `PUT /api/decisions/{decisionId}/options/{optionId}` - Update option.
- `DELETE /api/decisions/{decisionId}/options/{optionId}` - Remove option.
- `POST /api/decisions/{decisionId}/votes` - Cast or update vote.
- `GET /api/decisions/{decisionId}/result` - Get computed result and explanation.
- `POST /api/decisions/{decisionId}/close` - Finalize decision.

### Settings

- `GET /api/settings` - Get all user settings.
- `PUT /api/settings/profile` - Update profile settings.
- `PUT /api/settings/notifications` - Update notification preferences.
- `PUT /api/settings/privacy` - Update privacy and permission preferences.
- `PUT /api/settings/localization` - Update language/region.
- `GET /api/settings/localization/options` - Get available languages (must return `en`, `fr`, `ar-ly`).
- `PUT /api/settings/theme` - Update theme mode.
- `POST /api/settings/sync` - Trigger backup/sync.
- `POST /api/settings/change-password` - Change password.
- `DELETE /api/settings/account` - Delete account.

