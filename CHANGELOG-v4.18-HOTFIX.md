# Liferadar v4.18 - Hotfix 1

**Release Date:** May 23, 2026

## Overview
Critical hotfix for production issue affecting date conversion in multiple entity services.

## 🐛 Bug Fixes

### Critical: Date Formatting Error in Entity Services
**Issue:** Production error `TypeError: startDate?.format is not a function`
**Affected Entities:**
- Trip Plan Steps
- SaaS Subscriptions
- Life Evaluations
- Evaluation Decisions

**Root Cause:** The `convertDateFromClient` methods in multiple entity services were calling `.format()` and `.toJSON()` directly on date objects without type checking. When dates arrived as strings or in unexpected formats, the methods would fail.

**Stack Trace:**
```
ERROR TypeError: t.startDate?.format is not a function
    at o.convertDateFromClient (common.03738bcd2429e00a.js:1:29347)
    at o.update (common.03738bcd2429e00a.js:1:28119)
    at o.save (7862.44f73d840f3f0064.js:1:46202)
```

**Solution:** Implemented robust date normalization methods with proper type checking:
- Added `normalizeDateToString()` and `normalizeDateTimeToString()` helper methods
- Handle all date formats: dayjs objects, native Date objects, strings, and raw values
- Safe fallback for invalid dates (returns null instead of throwing)

### Files Modified

#### 1. **trip-plan-step.service.ts**
- Updated `convertDateFromClient()` to use `normalizeDateToString()` helper
- Handles startDate, endDate in main object and nested subSteps
- Supports dayjs objects, Date objects, strings, and parsed values

#### 2. **saas-subscription.service.ts**
- Added `normalizeDateToString()` and `normalizeDateTimeToString()` helpers
- Updated `convertDateFromClient()` to handle all date fields safely:
  - billDate, dueDate, paidDate (formatted dates)
  - subscriptionDate, renewalDate (formatted dates)
  - createdDate, lastModifiedDate (ISO strings)

#### 3. **life-evaluation.service.ts**
- Added `normalizeDateToString()` and `normalizeDateTimeToString()` helpers
- Updated `convertDateFromClient()` for:
  - evaluationDate (formatted date)
  - reminderAt (ISO JSON datetime)

#### 4. **evaluation-decision.service.ts**
- Added `normalizeDateTimeToString()` helper
- Updated `convertDateFromClient()` for date field

### Date Conversion Logic
```typescript
private normalizeDateToString(date: any, format?: string): string | null {
  if (!date) return null;                               // Handle null/undefined
  if (typeof date.format === 'function') {             // Dayjs object
    return date.format(format);
  }
  if (typeof date === 'string') {                      // Already a string
    return date;
  }
  if (date instanceof Date) {                          // Native Date object
    return dayjs(date).format(format);
  }
  const parsed = dayjs(date);                          // Try parsing
  return parsed.isValid() ? parsed.format(format) : null;
}
```

## ✅ Testing

### Manual Testing Steps
1. Create a new SaaS Subscription with date fields
2. Update an existing Trip Plan Step with dates
3. Save a Life Evaluation with dates
4. Update an Evaluation Decision

All operations should complete without date formatting errors.

### Browser Console
- No `startDate?.format is not a function` errors
- No date conversion errors in production logs

## 🚀 Deployment

### Build Instructions
```bash
npm run build                  # Build Angular frontend
./mvnw clean package -DskipTests  # Build with Maven
```

### Docker Deployment
```bash
docker build -t liferadar:4.18-hotfix1 .
docker push 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1
```

### Update docker-compose.yml
```yaml
app:
  image: 682033485934.dkr.ecr.eu-central-1.amazonaws.com/liferadar/apps:4.18-hotfix1
```

Then:
```bash
docker-compose pull
docker-compose up -d
```

## 📊 Impact

- **Severity:** Critical (Production blocking)
- **Affected Users:** All users using date input forms
- **Resolution Time:** Immediate with new deployment
- **Data Loss:** None

## 🔄 Version History

### 4.18 (Initial Release)
- Multiple entity services with date fields
- Missing type safety in date conversion

### 4.18-Hotfix1 (This Release)
- ✅ Fixed date type checking in all entity services
- ✅ Added robust date normalization helpers
- ✅ Comprehensive null/type handling

## Notes

- All date formatting follows existing `DATE_TIME_FORMAT` and `DATE_FORMAT` constants
- Backward compatible with existing date formats
- No database migration required
- No API changes

---
**Deployed by:** GitHub Copilot
**Commit:** Hotfix for date conversion errors

