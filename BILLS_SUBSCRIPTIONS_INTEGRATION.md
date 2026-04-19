# Integration Guide: Timezone & Currency in Bills-Subscriptions

## Overview
This guide shows how to integrate the timezone and currency settings from the ExtendedUser preferences into the bills-subscriptions component for displaying dates and amounts according to user preferences.

## Step 1: Inject ExtendedUserService

Update `bills-subscriptions.component.ts`:

```typescript
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

export default class BillsSubscriptionsComponent implements OnInit, OnDestroy {
  // ...existing code...

  private readonly extendedUserService = inject(ExtendedUserService);
  
  userPreferences: IExtendedUser | null = null;
```

## Step 2: Load User Preferences

Add to the `ngOnInit()` method:

```typescript
ngOnInit(): void {
  this.loadData();
  this.loadUserPreferences();
}

private loadUserPreferences(): void {
  this.extendedUserService.findCurrentUser().subscribe({
    next: (user) => {
      this.userPreferences = user;
    },
    error: (error) => {
      console.error('Failed to load user preferences', error);
      // Use defaults if loading fails
      this.userPreferences = { timezone: 'UTC', currency: 'USD' } as IExtendedUser;
    },
  });
}
```

## Step 3: Format Dates Using User's Timezone

Add formatting methods:

```typescript
/**
 * Format date using user's timezone preference
 */
formatDateForUser(date: any): string {
  if (!date || !this.userPreferences?.timezone) {
    return new Date(date).toLocaleDateString();
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('en-US', {
    timeZone: this.userPreferences.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time using user's timezone preference
 */
formatDateTimeForUser(date: any): string {
  if (!date || !this.userPreferences?.timezone) {
    return new Date(date).toLocaleString();
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleString('en-US', {
    timeZone: this.userPreferences.timezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

## Step 4: Format Currency Using User's Preference

Add currency formatting method:

```typescript
/**
 * Format currency using user's currency preference
 * Overrides the existing formatCurrency method
 */
formatCurrencyForUser(value: number | undefined): string {
  if (!value) return '$0.00';
  
  const currencyCode = this.userPreferences?.currency || 'USD';
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CHF: 'CHF',
    CAD: '$',
    AUD: '$',
    NZD: '$',
    CNY: '¥',
    HKD: '$',
    SGD: '$',
    INR: '₹',
    MXN: '$',
    BRL: 'R$',
    ZAR: 'R',
    AED: 'د.إ',
    SAR: '﷼',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
  };

  const symbol = currencySymbols[currencyCode] || currencyCode;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
```

## Step 5: Update Template to Use New Formatters

Replace date and currency pipes in `bills-subscriptions.component.html`:

### For Subscriptions

**Before:**
```html
<td>{{ subscription.renewalDate | date: 'mediumDate' }}</td>
```

**After:**
```html
<td>{{ formatDateForUser(subscription.renewalDate) }}</td>
```

### For Bills

**Before:**
```html
<td>{{ bill.billDate | date: 'mediumDate' }}</td>
<td>{{ bill.dueDate | date: 'mediumDate' }}</td>
<td>{{ formatCurrency(bill.amount) }}</td>
```

**After:**
```html
<td>{{ formatDateForUser(bill.billDate) }}</td>
<td>{{ formatDateForUser(bill.dueDate) }}</td>
<td>{{ formatCurrencyForUser(bill.amount) }}</td>
```

### For Upcoming Renewals

**Before:**
```html
<p class="mb-0 text-muted small" *ngIf="renewal.renewalDate">
  Renewal date: {{ convertToDate(renewal.renewalDate) | date: 'mediumDate' }}
</p>
```

**After:**
```html
<p class="mb-0 text-muted small" *ngIf="renewal.renewalDate">
  Renewal date: {{ formatDateForUser(renewal.renewalDate) }}
</p>
```

## Step 6: Update Dashboard to Use User Preferences

In the dashboard tab, update currency formatting:

**Before:**
```html
<strong>{{ formatCurrency(metrics.totalMonthlyCost) }}</strong>
<strong>{{ formatCurrency(metrics.totalAnnualCost) }}</strong>
```

**After:**
```html
<strong>{{ formatCurrencyForUser(metrics.totalMonthlyCost) }}</strong>
<strong>{{ formatCurrencyForUser(metrics.totalAnnualCost) }}</strong>
```

## Complete Updated Component Example

```typescript
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
// ... other imports ...
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

@Component({
  selector: 'jhi-bills-subscriptions',
  templateUrl: './bills-subscriptions.component.html',
  styleUrl: './bills-subscriptions.component.scss',
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgbModule, FaIconComponent],
})
export default class BillsSubscriptionsComponent implements OnInit, OnDestroy {
  // ...existing injections...
  private readonly extendedUserService = inject(ExtendedUserService);

  // ...existing properties...
  userPreferences: IExtendedUser | null = null;

  ngOnInit(): void {
    this.loadData();
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    this.extendedUserService.findCurrentUser().subscribe({
      next: (user) => {
        this.userPreferences = user;
      },
      error: (error) => {
        console.error('Failed to load user preferences', error);
        this.userPreferences = { timezone: 'UTC', currency: 'USD' } as IExtendedUser;
      },
    });
  }

  // ... existing methods ...

  formatDateForUser(date: any): string {
    if (!date || !this.userPreferences?.timezone) {
      return new Date(date).toLocaleDateString();
    }
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      timeZone: this.userPreferences.timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatCurrencyForUser(value: number | undefined): string {
    if (!value) return '$0.00';
    const currencyCode = this.userPreferences?.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(value);
  }

  convertToDate(dayjsDate: any): Date | null {
    if (!dayjsDate) return null;
    return dayjsDate.toDate();
  }

  // ... rest of existing methods ...
}
```

## Benefits

✅ **Respects User Preferences**: All dates and amounts display in user's selected timezone and currency
✅ **Consistent Experience**: Same formatting across all views
✅ **Automatic Updates**: Changing preferences in settings automatically reflects in this component
✅ **Accessible**: Uses standard JavaScript Intl API for localization
✅ **No Breaking Changes**: Existing functionality preserved

## Testing

1. **Update settings**: Go to `/account/settings` and change timezone to "America/New_York" and currency to "EUR"
2. **Navigate to bills-subscriptions**: Check that all dates show in the new timezone
3. **Verify currency**: All amounts should display with EUR symbol (€) and formatting
4. **Test persistence**: Refresh page, dates and currency should persist
5. **Test different timezones**: Change timezone multiple times, verify each time

## Notes

- The formatDateForUser() method respects user's selected timezone
- The formatCurrencyForUser() method uses the Intl API for proper formatting
- Fallback to defaults (UTC, USD) if user preferences fail to load
- The methods work with both Dayjs and native Date objects

