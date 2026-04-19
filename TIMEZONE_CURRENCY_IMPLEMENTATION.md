# Timezone and Currency Configuration Implementation

## Overview
This implementation adds timezone and currency settings to the user configuration, allowing users to manage their preferences which are stored in the database.

## Changes Made

### Database Changes

#### 1. Liquibase Migration
**File**: `/Users/houssem/Work/1- Liferadar/src/main/resources/config/liquibase/changelog/20260415150000_add_timezone_currency_to_extended_user.xml`

- Created new migration to add `timezone` (varchar 50, default UTC) and `currency` (varchar 3, default USD) columns to the `extended_user` table
- Both columns are non-nullable with sensible defaults for backward compatibility

#### 2. Master Changelog
**File**: `/Users/houssem/Work/1- Liferadar/src/main/resources/config/liquibase/master.xml`

- Registered the new migration file in the master changelog

### Backend Changes

#### 1. Extended User Entity
**File**: `/Users/houssem/Work/1- Liferadar/src/main/java/com/atharsense/lr/domain/ExtendedUser.java`

- Added `timezone` field (max 50 chars, default "UTC")
- Added `currency` field (max 3 chars, default "USD")
- Added getter/setter methods following JHipster patterns
- Updated `toString()` method to include new fields

#### 2. Admin User DTO
**File**: `/Users/houssem/Work/1- Liferadar/src/main/java/com/atharsense/lr/service/dto/AdminUserDTO.java`

- Added `timezone` and `currency` fields
- Added validation constraints (@Size)
- Added getter/setter methods
- Updated `toString()` method

#### 3. User Service
**File**: `/Users/houssem/Work/1- Liferadar/src/main/java/com/atharsense/lr/service/UserService.java`

- Added `updateUserPreferences(String timezone, String currency)` method
- Added `loadExtendedUserInfo(AdminUserDTO userDTO)` method to load extended user data into DTOs
- Updated `ensureExtendedUser()` to set timezone and currency when creating new users

#### 4. Account Resource
**File**: `/Users/houssem/Work/1- Liferadar/src/main/java/com/atharsense/lr/web/rest/AccountResource.java`

- Updated `getAccount()` to load extended user info (timezone, currency)
- Updated `saveAccount()` to persist timezone and currency preferences

### Frontend Changes

#### 1. Preferences Constants
**File**: `/Users/houssem/Work/1- Liferadar/src/main/webapp/app/shared/constants/preferences.constants.ts` (NEW)

- Created constants for timezone options (20 common timezones)
- Created constants for currency options (20 common currencies)
- Each option has a value and descriptive label

#### 2. Extended User Model
**File**: `/Users/houssem/Work/1- Liferadar/src/main/webapp/app/entities/extended-user/extended-user.model.ts`

- Added `timezone?: string | null` property
- Added `currency?: string | null` property

#### 3. Account Model
**File**: `/Users/houssem/Work/1- Liferadar/src/main/webapp/app/core/auth/account.model.ts`

- Added optional `timezone?: string | null` parameter to Account constructor
- Added optional `currency?: string | null` parameter to Account constructor

#### 4. Settings Component
**File**: `/Users/houssem/Work/1- Liferadar/src/main/webapp/app/account/settings/settings.component.ts`

- Imported timezone and currency constants
- Added `timezones` and `currencies` properties
- Added form controls for `timezone` (default UTC) and `currency` (default USD)

#### 5. Settings Template
**File**: `/Users/houssem/Work/1- Liferadar/src/main/webapp/app/account/settings/settings.component.html`

- Added timezone select dropdown with all timezone options
- Added currency select dropdown with all currency options
- Both selectors are placed after the language selector

## How It Works

### User Registration Flow
1. When a user registers, the `ensureExtendedUser()` method creates an ExtendedUser record
2. Timezone and currency are set to defaults (UTC and USD) during registration
3. User can immediately customize these in the settings page

### User Settings Flow
1. User navigates to settings page
2. Settings form loads with current timezone and currency values via `getAccount()` API call
3. User can change timezone and currency from dropdown selectors
4. Clicking "Save" sends the updated values to the backend
5. `saveAccount()` persists the changes to the database via `updateUserPreferences()`

### Data Storage
- Timezone and currency are stored in the `extended_user` table
- They are associated with the user via the User-ExtendedUser relationship
- Values persist in the database and are loaded for each session

## API Endpoints

### GET /api/account
Returns the current user's account information including:
- Basic user info (firstName, lastName, email, langKey, etc.)
- Extended user info (timezone, currency)

### POST /api/account
Accepts updated account information and saves:
- Basic user info
- Timezone and currency preferences

## Testing

### Manual Testing Steps
1. Create a new user account
2. Go to Settings page
3. Verify timezone defaults to "UTC" and currency defaults to "USD"
4. Change timezone to a different value (e.g., "America/New_York")
5. Change currency to a different value (e.g., "EUR")
6. Click Save
7. Refresh the page
8. Verify the new values persist
9. Log out and log back in
10. Verify values are still saved

## Backward Compatibility
- Existing users will automatically get default values (UTC, USD) when the migration runs
- No data loss occurs during the migration
- Existing ExtendedUser records are preserved

## Future Enhancements
- Add timezone/currency-aware date formatting in templates
- Use timezone for server-side date calculations
- Format currency values based on user's selected currency
- Add preferences API endpoint for managing other user preferences

