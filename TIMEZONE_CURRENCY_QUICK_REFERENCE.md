# Quick Reference: Timezone and Currency Configuration

## Files Modified/Created

### Backend (Java)
1. **ExtendedUser.java** - Added timezone & currency fields
2. **AdminUserDTO.java** - Added timezone & currency fields  
3. **UserService.java** - Added methods to update and load preferences
4. **AccountResource.java** - Updated to handle new fields
5. **20260415150000_add_timezone_currency_to_extended_user.xml** - Database migration
6. **master.xml** - Registered migration

### Frontend (Angular)
1. **preferences.constants.ts** - Timezone & currency options (NEW)
2. **extended-user.model.ts** - Updated model interface
3. **account.model.ts** - Updated Account class
4. **settings.component.ts** - Added form controls
5. **settings.component.html** - Added UI controls

## Database Schema Changes

```sql
ALTER TABLE extended_user ADD COLUMN timezone VARCHAR(50) NOT NULL DEFAULT 'UTC';
ALTER TABLE extended_user ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';
```

## Default Values
- Timezone: `UTC`
- Currency: `USD`

## Supported Timezones (20)
UTC, America/New_York, America/Chicago, America/Denver, America/Los_Angeles, Europe/London, Europe/Paris, Europe/Berlin, Europe/Amsterdam, Asia/Dubai, Asia/Kolkata, Asia/Bangkok, Asia/Singapore, Asia/Hong_Kong, Asia/Tokyo, Asia/Shanghai, Australia/Sydney, Australia/Melbourne, Pacific/Auckland

## Supported Currencies (20)
USD, EUR, GBP, JPY, CHF, CAD, AUD, NZD, CNY, HKD, SGD, INR, MXN, BRL, ZAR, AED, SAR, SEK, NOK, DKK

## API Endpoints

### Get Current User Account
```
GET /api/account
Response:
{
  "id": 1,
  "login": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "langKey": "en",
  "timezone": "UTC",
  "currency": "USD",
  ...
}
```

### Update User Account (including preferences)
```
POST /api/account
Request Body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "langKey": "en",
  "timezone": "America/New_York",
  "currency": "EUR",
  ...
}
```

## Settings UI Location
- Path: `/account/settings`
- Component: `SettingsComponent`
- Template: `settings.component.html`

The timezone and currency selectors appear after the language selector on the settings page.

## How Preferences are Persisted

1. **On User Registration**: 
   - ExtendedUser created automatically with default timezone (UTC) and currency (USD)

2. **On Settings Update**:
   - Form submits to `/api/account` POST endpoint
   - Backend updates ExtendedUser record with new values
   - Values persist in database

3. **On Page Reload/Login**:
   - GET `/api/account` retrieves current values from database
   - Settings form is populated with persisted values

## Testing Commands

### Verify Database Migration
```sql
SELECT * FROM extended_user LIMIT 1;
-- Should show timezone and currency columns
```

### Check Default Values
```sql
SELECT timezone, currency FROM extended_user WHERE user_id = 1;
-- Should return: UTC | USD
```

### Test API Response
```bash
curl -X GET http://localhost:8080/api/account \
  -H "Authorization: Bearer <token>"
```

## Troubleshooting

### Timezone/Currency not saving
- Verify Liquibase migration ran successfully
- Check that ExtendedUser record exists for the user
- Review AccountResource logs for errors

### Values reverting to defaults
- Ensure form controls are properly bound (`formControlName`)
- Verify POST endpoint is called when saving
- Check browser network tab for failed requests

### Missing UI selectors
- Import `TIMEZONES` and `CURRENCIES` in settings component
- Ensure HTML template has timezone/currency form controls
- Verify form group includes timezone and currency controls

## Future Enhancements

Ideas for extending this implementation:
- Add date formatting pipes that respect user timezone
- Add currency formatting pipes using user's selected currency  
- Create standalone preferences management component
- Add validation for timezone (verify against IANA database)
- Add audit logging for preference changes
- Export user preferences to JSON

