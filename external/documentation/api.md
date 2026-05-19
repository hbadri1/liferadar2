# Liferadar Mobile API Contract (Flutter)

This document maps the current backend REST APIs to the Flutter app needs, with request inputs, response outputs, success codes, and error behavior.

## 1) Conventions

### Base URL

- Dev example: `https://<host>/api`
- All paths below are written as absolute API paths (starting with `/api/...`).

### Auth

- Authentication is JWT Bearer token.
- Send token on protected endpoints:

```http
Authorization: Bearer <id_token>
Content-Type: application/json
Accept: application/json
```

### Localization

- Current project locales are `en`, `fr`, `ar-ly`.
- User language is stored in `AdminUserDTO.langKey` and can be updated via `POST /api/account`.

### Pagination

- List endpoints using `Pageable` accept common params such as `page`, `size`, `sort`.
- Paginated responses include headers like `Link` and `X-Total-Count`.

### Standard Error Shape (RFC7807)

On errors, backend returns a Problem Details JSON payload similar to:

```json
{
  "type": "https://www.jhipster.tech/problem/problem-with-message",
  "title": "Bad Request",
  "status": 400,
  "detail": "...",
  "message": "error.http.400",
  "path": "/api/trip-plans"
}
```

Validation errors may also include:

```json
{
  "fieldErrors": [
	{
	  "objectName": "createTripPlanRequest",
	  "field": "title",
	  "message": "must not be blank"
	}
  ]
}
```

---

## 2) Data Models (Mobile-facing)

These are the key payload structures used by Flutter when calling the APIs.

### LoginVM

```json
{
  "username": "string (1..50)",
  "password": "string (4..100)",
  "rememberMe": true
}
```

### JWTToken

```json
{
  "id_token": "<jwt>"
}
```

### AdminUserDTO (settings/account)

```json
{
  "id": 123,
  "login": "user1",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@demo.com",
  "imageUrl": "https://...",
  "activated": true,
  "langKey": "en",
  "timezone": "Asia/Riyadh",
  "currency": "SAR",
  "authorities": ["ROLE_USER", "ROLE_PARENT"]
}
```

### CreateTripPlanRequest

```json
{
  "title": "Summer Trip",
  "description": "Optional, max 800",
  "startDate": "2026-06-10T08:00:00",
  "endDate": "2026-06-15T20:00:00",
  "tripType": "PERSONAL",
  "isActive": true,
  "actionsJson": "{...optional json string...}"
}
```

### TripPlan

```json
{
  "id": 55,
  "title": "Summer Trip",
  "description": "...",
  "startDate": "2026-06-10T08:00:00",
  "endDate": "2026-06-15T20:00:00",
  "isActive": true,
  "tripType": "PERSONAL",
  "actionsJson": "{...}",
  "owner": { "id": 9 }
}
```

### TripPlanStep

```json
{
  "id": 900,
  "startDate": "2026-06-10T09:00:00",
  "endDate": "2026-06-10T11:00:00",
  "actionName": "Visit museum",
  "sequence": 1,
  "notes": "Optional",
  "locationName": "Louvre",
  "latitude": 48.8606,
  "longitude": 2.3376,
  "tripPlan": { "id": 55 }
}
```

### CreateSaaSSubscriptionRequest (Expense create)

```json
{
  "serviceName": "Netflix",
  "description": "Monthly streaming",
  "monthlyCost": 12.99,
  "currency": "USD",
  "annualCost": 155.88,
  "billDate": "2026-05-01",
  "dueDate": "2026-05-05",
  "paidDate": "2026-05-02",
  "subscriptionDate": "2026-01-01",
  "renewalDate": "2027-01-01",
  "billingCycle": "MONTHLY",
  "autoRenewal": true,
  "manualRenewal": false,
  "renewalReminder": "ONE_WEEK",
  "receiptUrl": "https://...",
  "paymentMethod": "CREDIT_CARD",
  "providerUrl": "https://netflix.com",
  "accountEmail": "demo@demo.com",
  "accountUsername": "john",
  "notes": "Optional",
  "isShared": false
}
```

### SaaSSubscription (Expense)

```json
{
  "id": 404,
  "serviceName": "Netflix",
  "monthlyCost": 12.99,
  "currency": "USD",
  "billingCycle": "MONTHLY",
  "status": "NEW",
  "autoRenewal": true,
  "manualRenewal": false,
  "owner": { "id": 9 }
}
```

### Family CreateChildRequest

```json
{
  "login": "kid1",
  "firstName": "Ali",
  "email": "kid1@demo.com",
  "password": "Passw0rd!"
}
```

### FamilyInfo

```json
{
  "id": 77,
  "name": "My Family"
}
```

### CreateFamilyObjectiveRequest

```json
{
  "name": "Healthy Week",
  "description": "Optional",
  "kidLogins": ["kid1", "kid2"],
  "itemDefinitions": [
	{
	  "name": "Drink water",
	  "description": "8 cups",
	  "unit": "COUNT"
	}
  ]
}
```

### CreateObjectiveProgressRequest

```json
{
  "value": 1,
  "notes": "Done for today"
}
```

### FamilyObjectiveDTO

```json
{
  "id": 111,
  "kidId": 34,
  "kidLogin": "kid1",
  "kidName": "Ali",
  "name": "Healthy Week",
  "description": "Optional",
  "active": true,
  "createdAt": "2026-05-17T10:00:00Z",
  "itemDefinitions": []
}
```

### EvaluationDecision

```json
{
  "id": 501,
  "decision": "Choose summer destination",
  "date": "2026-05-17T10:00:00Z",
  "owner": { "id": 9 },
  "lifeEvaluation": { "id": 300 },
  "expense": { "id": 404 }
}
```

### Metrics DTOs

```json
{
  "totalSubscriptions": 10,
  "activeSubscriptions": 7,
  "pausedSubscriptions": 1,
  "cancelledSubscriptions": 2,
  "totalMonthlyCost": 120.50,
  "totalAnnualCost": 1446.00,
  "averageMonthlyCost": 12.05,
  "upcomingRenewalsCount": 3
}
```

```json
{
  "totalPaidSar": 450.00,
  "timezone": "Asia/Riyadh",
  "monthStart": "2026-05-01",
  "monthEnd": "2026-05-31"
}
```

---

## 3) Authentication APIs

### `POST /api/authenticate`

- Input: `LoginVM`
- Output: `JWTToken`
- Success: `200 OK`
- Errors:
  - `401 Unauthorized` (bad credentials)
  - `400 Bad Request` (invalid payload)

### `GET /api/authenticate`

- Input: none
- Output: empty body
- Success: `204 No Content` (authenticated)
- Errors:
  - `401 Unauthorized` (not authenticated)

---

## 4) Settings / Account APIs

### `GET /api/account`

- Input: none
- Output: `AdminUserDTO`
- Success: `200 OK`
- Errors:
  - `500 Internal Server Error` if current user cannot be loaded

### `POST /api/account`

- Input: `AdminUserDTO` (used fields: `firstName`, `lastName`, `email`, `langKey`, `imageUrl`, `timezone`, `currency`)
- Output: empty body
- Success: `200 OK`
- Errors:
  - `400 Bad Request` email already used / validation issue

### `POST /api/account/change-password`

- Input:

```json
{
  "currentPassword": "old",
  "newPassword": "newStrongPassword"
}
```

- Output: empty body
- Success: `200 OK`
- Errors:
  - `400 Bad Request` invalid password length

### `POST /api/account/reset-password/init`

- Input: raw JSON string email (example: `"user@demo.com"`)
- Output: empty body
- Success: `200 OK`
- Errors: intentionally masked for security (invalid email still returns success)

### `POST /api/account/reset-password/finish`

- Input:

```json
{
  "key": "reset-key",
  "newPassword": "newStrongPassword"
}
```

- Output: empty body
- Success: `200 OK`
- Errors:
  - `400 Bad Request` invalid password
  - `500 Internal Server Error` invalid/expired key

### `POST /api/account/enable-family-management`

- Input: none
- Output: empty body
- Success: `200 OK`
- Errors: `500` if user not found

### `POST /api/account/disable-family-management`

- Input: none
- Output: empty body
- Success: `200 OK`
- Errors: `500` if user not found

---

## 5) Trips APIs

### Trip Plans

#### `GET /api/trip-plans/my`

- Input: none
- Output: `TripPlan[]`
- Success: `200 OK`
- Errors: `403 Forbidden` if role not allowed

#### `POST /api/trip-plans`

- Input: `CreateTripPlanRequest`
- Output: `TripPlan`
- Success: `201 Created`
- Errors:
  - `400 Bad Request` with keys such as:
	- `startDateInPast`
	- `endDateInPast`
	- `startDateAfterEndDate`
  - `403 Forbidden` if role not allowed

#### `PUT /api/trip-plans/{id}`

- Input: full `TripPlan` (id in path and body must match)
- Output: `TripPlan`
- Success: `200 OK`
- Errors:
  - `400` `idnull`, `idinvalid`, `idnotfound`, date validation errors

#### `PATCH /api/trip-plans/{id}`

- Input: partial `TripPlan` (must include `id`)
- Output: `TripPlan`
- Success: `200 OK`
- Errors: `400` (`idnull`, `idinvalid`, `idnotfound`), `404` not found

#### `GET /api/trip-plans`

- Input: criteria + pagination query params
- Output: `TripPlan[]` (+ pagination headers)
- Success: `200 OK`

#### `GET /api/trip-plans/count`

- Input: criteria query params
- Output:

```json
123
```

- Success: `200 OK`

#### `GET /api/trip-plans/{id}`

- Input: path `id`
- Output: `TripPlan`
- Success: `200 OK`
- Errors: `404 Not Found`

#### `DELETE /api/trip-plans/{id}`

- Input: path `id`
- Output: empty body
- Success: `204 No Content`
- Errors: `403 Forbidden`

### Trip Steps

#### `GET /api/trip-plan-steps/by-trip/{tripPlanId}`

- Input: path `tripPlanId`
- Output: `TripPlanStep[]`
- Success: `200 OK`

#### `POST /api/trip-plan-steps`

- Input: full `TripPlanStep`
- Output: `TripPlanStep`
- Success: `201 Created`
- Errors:
  - `400` `idexists`, `stepMissingTrip`, `tripNotFound`, `stepStartDateBeforeTripStart`, `stepEndDateAfterTripEnd`, `stepStartDateAfterEndDate`, `pinIncomplete`, `latitudeOutOfRange`, `longitudeOutOfRange`

#### `PUT /api/trip-plan-steps/{id}`

- Input: full `TripPlanStep`
- Output: `TripPlanStep`
- Success: `200 OK`
- Errors: `400` `idnull`, `idinvalid`, `idnotfound`, plus same validation keys as create

#### `PATCH /api/trip-plan-steps/{id}`

- Input: partial `TripPlanStep` (must include `id`)
- Output: `TripPlanStep`
- Success: `200 OK`
- Errors: `400` (`idnull`, `idinvalid`, `idnotfound`), `404`

#### `GET /api/trip-plan-steps`

- Input: none
- Output: `TripPlanStep[]`
- Success: `200 OK`

#### `GET /api/trip-plan-steps/{id}`

- Input: path `id`
- Output: `TripPlanStep`
- Success: `200 OK`
- Errors: `404`

#### `DELETE /api/trip-plan-steps/{id}`

- Input: path `id`
- Output: empty body
- Success: `204 No Content`
- Errors: `403`

---

## 6) Finances APIs (`/api/expenses`)

### `POST /api/expenses`

- Input: `CreateSaaSSubscriptionRequest`
- Output: `SaaSSubscription`
- Success: `201 Created`
- Errors:
  - `400 Bad Request` validation errors
  - `400` `userfound` if current user mapping fails

### `PUT /api/expenses/{id}`

- Input: full `SaaSSubscription`
- Output: `SaaSSubscription`
- Success: `200 OK`
- Errors:
  - `400` `idnull`, `idinvalid`, `idnotfound`, `paidexpense`

### `PATCH /api/expenses/{id}`

- Input: partial `SaaSSubscription` (must include `id`)
- Output: `SaaSSubscription`
- Success: `200 OK`
- Errors:
  - `400` `idnull`, `idinvalid`, `idnotfound`, `paidexpense`

### `GET /api/expenses`

- Input: pagination query params
- Output: `SaaSSubscription[]` (+ pagination headers)
- Success: `200 OK`

### `GET /api/expenses/my`

- Input: none
- Output: `SaaSSubscription[]`
- Success: `200 OK`

### `GET /api/expenses/{id}`

- Input: path `id`
- Output: `SaaSSubscription`
- Success: `200 OK`
- Errors: `404`

### `DELETE /api/expenses/{id}`

- Input: path `id`
- Output: empty body
- Success: `204 No Content`
- Errors: `403`

### `GET /api/expenses/metrics/dashboard`

- Input: none
- Output: `SubscriptionMetricsDTO`
- Success: `200 OK`

### `GET /api/expenses/metrics/monthly-paid-current`

- Input: none
- Output: `MonthlyPaidExpensesDTO`
- Success: `200 OK`

### `GET /api/expenses/upcoming/renewals?days=30`

- Input: query `days` (optional, default `30`)
- Output: `SaaSSubscription[]`
- Success: `200 OK`

---

## 7) Family APIs (`/api/family`)

### Members and Family Info

#### `GET /api/family/children`

- Input: none
- Output: `AdminUserDTO[]` (children/siblings scope based on role)
- Success: `200 OK`
- Errors: `400 notauthenticated`, `403`

#### `POST /api/family/children`

- Input: `CreateChildRequest`
- Output: `AdminUserDTO`
- Success: `200 OK`
- Errors:
  - `400 loginalreadyused`
  - `400 emailalreadyused`
  - `403`

#### `DELETE /api/family/children/{login}`

- Input: path `login`
- Output: empty body
- Success: `204 No Content`
- Errors:
  - `400 notauthenticated`, `notfound`, `forbidden`, `notchild`

#### `GET /api/family/parents`

- Input: none
- Output: `AdminUserDTO[]`
- Success: `200 OK`
- Errors: `400 notauthenticated`, `403`

#### `POST /api/family/parents`

- Input: `CreateChildRequest` (`email` required)
- Output: `AdminUserDTO`
- Success: `200 OK`
- Errors:
  - `400 emailrequired`, `loginalreadyused`, `emailalreadyused`
  - `403`

#### `DELETE /api/family/parents/{login}`

- Input: path `login`
- Output: empty body
- Success: `204 No Content`
- Errors:
  - `400 notauthenticated`, `notfound`, `forbidden`, `notparent`

#### `GET /api/family/info`

- Input: none
- Output: `FamilyInfo`
- Success: `200 OK` (creates family if missing)
- Errors: `400 notauthenticated`, `notfound`

#### `PUT /api/family/info`

- Input:

```json
{
  "name": "Family Name"
}
```

- Output: `FamilyInfo`
- Success: `200 OK`
- Errors: `400 notauthenticated`, `notfound`, `403`

### Objectives

#### `GET /api/family/objectives`

- Input: none
- Output: `FamilyObjectiveDTO[]`
- Success: `200 OK`
- Errors: `403`

#### `POST /api/family/objectives`

- Input: `CreateFamilyObjectiveRequest`
- Output: `FamilyObjectiveDTO[]`
- Success: `200 OK`
- Errors: `400` validation, `403`

#### `PUT /api/family/objectives/{objectiveId}`

- Input: `UpdateFamilyObjectiveRequest`
- Output: `FamilyObjectiveDTO`
- Success: `200 OK`
- Errors: `400`, `403`

#### `PATCH /api/family/objectives/{objectiveId}/deactivate`

- Input: none
- Output: `FamilyObjectiveDTO`
- Success: `200 OK`
- Errors: `400`, `403`

#### `DELETE /api/family/objectives/{objectiveId}`

- Input: path `objectiveId`
- Output: empty body
- Success: `204 No Content`
- Errors: `400`, `403`

#### `POST /api/family/objective-items/{itemDefinitionId}/progress`

- Input: `CreateObjectiveProgressRequest`
- Output: `FamilyObjectiveDTO`
- Success: `200 OK`
- Errors: `400` validation, `403`

---

## 8) Decision APIs (`/api/evaluation-decisions`)

### `POST /api/evaluation-decisions`

- Input: `EvaluationDecision` (without `id`; `owner` is auto-set)
- Output: `EvaluationDecision`
- Success: `201 Created`
- Errors:
  - `400 idexists`
  - `400 notauthenticated`
  - `400 usernotfound`

### `PUT /api/evaluation-decisions/{id}`

- Input: full `EvaluationDecision`
- Output: `EvaluationDecision`
- Success: `200 OK`
- Errors: `400 idnull`, `idinvalid`, `idnotfound`

### `PATCH /api/evaluation-decisions/{id}`

- Input: partial `EvaluationDecision` (must include `id`)
- Output: `EvaluationDecision`
- Success: `200 OK`
- Errors: `400 idnull`, `idinvalid`, `idnotfound`, `404`

### `GET /api/evaluation-decisions`

- Input: criteria + pagination query params
- Output: `EvaluationDecision[]` (+ pagination headers)
- Success: `200 OK` (auto-filtered to current user's owner)
- Errors: `400 notauthenticated`, `usernotfound`

### `GET /api/evaluation-decisions/count`

- Input: criteria query params
- Output:

```json
42
```

- Success: `200 OK`

### `GET /api/evaluation-decisions/{id}`

- Input: path `id`
- Output: `EvaluationDecision`
- Success: `200 OK`
- Errors: `404`

### `DELETE /api/evaluation-decisions/{id}`

- Input: path `id`
- Output: empty body
- Success: `204 No Content`

---

## 9) Notifications APIs (`/api/notifications`)

### `GET /api/notifications/my?unreadOnly=true`

- Input: optional query `unreadOnly`, pagination params
- Output: `NotificationVM[]`
- Success: `200 OK`

### `GET /api/notifications/my/unread-count`

- Input: none
- Output:

```json
{ "count": 3 }
```

- Success: `200 OK`

### `PATCH /api/notifications/{id}/read`

- Input: path `id`
- Output: `NotificationVM`
- Success: `200 OK`

### `PATCH /api/notifications/my/read-all`

- Input: none
- Output:

```json
{ "updated": 12 }
```

- Success: `200 OK`

---

## 10) Flutter Integration Checklist

- Use a single `Dio` client with auth interceptor for `Bearer` token injection.
- Parse Problem Details (`status`, `message`, `fieldErrors`) into typed app errors.
- Handle `204` and empty responses safely (do not always JSON-decode body).
- Persist `id_token`, selected `langKey` (`en` / `fr` / `ar-ly`), timezone, and currency.
- For paginated endpoints, read headers (`X-Total-Count`, `Link`) to drive infinite scroll.


