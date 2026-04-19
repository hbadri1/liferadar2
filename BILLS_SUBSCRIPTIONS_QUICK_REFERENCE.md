# Bills & Subscriptions - Quick Reference & Code Examples

## Quick Start Guide

### 1. Navigate to Bills & Subscriptions
```
URL: http://localhost:4200/bills-subscriptions
```

### 2. Available Tabs
- **Subscriptions**: Manage all SaaS subscriptions
- **Bills**: Track and manage bills
- **Dashboard**: View analytics and metrics

## Common Use Cases

### Use Case 1: Add a New Subscription

**UI Steps:**
1. Click "New Subscription" button
2. Fill in the form:
   - Service Name: Name of the SaaS service
   - Description: (Optional) Description
   - Monthly Cost: Cost per month
   - Annual Cost: (Optional) Total annual cost
   - Subscription Date: When you subscribed
   - Renewal Date: Next renewal date
   - Billing Cycle: Monthly/Quarterly/Semi-Annual/Annual
   - Status: Active/Paused/Cancelled/Pending/Expired
   - Provider URL: (Optional) Link to service
   - Account Email: Email associated with account
   - Account Username: Username for the account
   - Notes: Additional notes
3. Click "Save"

**TypeScript Code:**
```typescript
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { ISaaSSubscription, BillingCycle, SubscriptionStatus } from 'app/entities/saas-subscription/saas-subscription.model';

export class MyComponent {
  constructor(private subscriptionService: SaaSSubscriptionService) {}

  addSubscription() {
    const newSubscription: ISaaSSubscription = {
      serviceName: 'Netflix',
      description: 'Video streaming service',
      monthlyCost: 15.99,
      subscriptionDate: dayjs('2026-02-14'),
      renewalDate: dayjs('2026-03-14'),
      billingCycle: BillingCycle.MONTHLY,
      status: SubscriptionStatus.ACTIVE,
      accountEmail: 'user@example.com'
    };

    this.subscriptionService.create(newSubscription).subscribe(response => {
      console.log('Subscription created:', response.body);
    });
  }
}
```

### Use Case 2: Track a Bill

**UI Steps:**
1. Click "New Bill" button
2. Fill in the form:
   - Description: Bill description
   - Amount: Bill amount
   - Bill Date: Date bill was issued
   - Due Date: When payment is due
   - Status: Pending/Paid/Overdue/Cancelled/Partial
   - Receipt URL: (Optional) Link to receipt
   - Payment Method: How you'll pay
   - Is Recurring: Check if it's a recurring bill
   - Subscription: (Optional) Link to subscription
3. Click "Save"

**TypeScript Code:**
```typescript
import { BillService } from 'app/entities/bill/service/bill.service';
import { IBill, BillStatus, PaymentMethod } from 'app/entities/bill/bill.model';

export class MyComponent {
  constructor(private billService: BillService) {}

  addBill() {
    const newBill: IBill = {
      description: 'Netflix - February 2026',
      amount: 15.99,
      billDate: dayjs(),
      dueDate: dayjs().add(10, 'days'),
      status: BillStatus.PENDING,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      isRecurring: true,
      subscriptionId: 1
    };

    this.billService.create(newBill).subscribe(response => {
      console.log('Bill created:', response.body);
    });
  }
}
```

### Use Case 3: View Metrics and Analytics

**UI Steps:**
1. Click "Dashboard" tab
2. View subscription summary:
   - Total and active subscriptions
   - Monthly and annual costs
3. View bill summary:
   - Bills statistics
   - Financial amounts

**TypeScript Code:**
```typescript
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { BillService } from 'app/entities/bill/service/bill.service';

export class DashboardComponent implements OnInit {
  subscriptionMetrics$ = new Observable();
  billMetrics$ = new Observable();

  constructor(
    private subscriptionService: SaaSSubscriptionService,
    private billService: BillService
  ) {}

  ngOnInit() {
    this.subscriptionMetrics$ = this.subscriptionService.getMetrics();
    this.billMetrics$ = this.billService.getMetrics();
  }
}
```

### Use Case 4: Mark Bill as Paid

**UI Steps:**
1. Find bill in Bills list
2. Click the checkmark (✓) button
3. Bill status changes to "PAID"

**TypeScript Code:**
```typescript
markBillAsPaid(billId: number) {
  this.billService.markAsPaid(billId).subscribe(response => {
    console.log('Bill marked as paid:', response.body);
    this.refreshBills();
  });
}
```

### Use Case 5: Get Upcoming Renewals

**UI Steps:**
1. Go to Subscriptions tab
2. See "Upcoming Renewals (30 days)" section
3. List shows all renewals in next 30 days

**TypeScript Code:**
```typescript
getUpcomingRenewals() {
  this.subscriptionService.getUpcomingRenewals(30).subscribe(response => {
    const renewals = response.body || [];
    console.log('Renewals coming up:', renewals);
  });
}
```

### Use Case 6: Get Overdue Bills

**UI Steps:**
1. Go to Bills tab
2. Check the "Overdue Bills" alert section
3. List shows all overdue bills

**TypeScript Code:**
```typescript
getOverdueBills() {
  this.billService.getOverdueBills().subscribe(response => {
    const overdueBills = response.body || [];
    console.log('Overdue bills:', overdueBills);
  });
}
```

## API Reference

### Subscription Endpoints

#### Get All Subscriptions
```
GET /api/saas-subscriptions
GET /api/saas-subscriptions/my
Headers: Authorization: Bearer {token}
Response: ISaaSSubscription[]
```

#### Get Single Subscription
```
GET /api/saas-subscriptions/{id}
Headers: Authorization: Bearer {token}
Response: ISaaSSubscription
```

#### Create Subscription
```
POST /api/saas-subscriptions
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body: CreateSaaSSubscriptionRequest

Response: ISaaSSubscription (201 Created)
```

#### Update Subscription
```
PUT /api/saas-subscriptions/{id}
Headers: Authorization: Bearer {token}
Body: ISaaSSubscription

Response: ISaaSSubscription (200 OK)
```

#### Partial Update
```
PATCH /api/saas-subscriptions/{id}
Headers: Authorization: Bearer {token}
Body: Partial<ISaaSSubscription>

Response: ISaaSSubscription (200 OK)
```

#### Delete Subscription
```
DELETE /api/saas-subscriptions/{id}
Headers: Authorization: Bearer {token}

Response: 204 No Content
```

#### Get Subscription Metrics
```
GET /api/saas-subscriptions/metrics/dashboard
Headers: Authorization: Bearer {token}

Response: SubscriptionMetricsDTO
{
  "totalSubscriptions": 5,
  "activeSubscriptions": 4,
  "pausedSubscriptions": 1,
  "cancelledSubscriptions": 0,
  "totalMonthlyCost": 150.50,
  "totalAnnualCost": 1806,
  "averageMonthlyCost": 30.10,
  "upcomingRenewalsCount": 2
}
```

#### Get Upcoming Renewals
```
GET /api/saas-subscriptions/upcoming/renewals?days=30
Headers: Authorization: Bearer {token}

Response: ISaaSSubscription[]
```

### Bill Endpoints

#### Get All Bills
```
GET /api/bills
GET /api/bills/my
Headers: Authorization: Bearer {token}
Response: IBill[]
```

#### Get Single Bill
```
GET /api/bills/{id}
Headers: Authorization: Bearer {token}
Response: IBill
```

#### Create Bill
```
POST /api/bills
Headers: 
  Authorization: Bearer {token}
  Content-Type: application/json
Body: CreateBillRequest

Response: IBill (201 Created)
```

#### Update Bill
```
PUT /api/bills/{id}
Headers: Authorization: Bearer {token}
Body: IBill

Response: IBill (200 OK)
```

#### Delete Bill
```
DELETE /api/bills/{id}
Headers: Authorization: Bearer {token}

Response: 204 No Content
```

#### Mark Bill as Paid
```
POST /api/bills/{id}/mark-paid
Headers: Authorization: Bearer {token}

Response: IBill (200 OK)
```

#### Get Bill Metrics
```
GET /api/bills/metrics/dashboard
Headers: Authorization: Bearer {token}

Response: BillMetricsDTO
{
  "totalBills": 10,
  "paidBills": 6,
  "pendingBills": 3,
  "overdueBills": 1,
  "cancelledBills": 0,
  "totalBillAmount": 500.00,
  "paidAmount": 300.00,
  "pendingAmount": 150.00,
  "overdueAmount": 50.00,
  "averageBillAmount": 50.00
}
```

#### Get Pending Bills
```
GET /api/bills/status/pending
Headers: Authorization: Bearer {token}
Response: IBill[]
```

#### Get Overdue Bills
```
GET /api/bills/status/overdue
Headers: Authorization: Bearer {token}
Response: IBill[]
```

#### Get Bills by Subscription
```
GET /api/bills/subscription/{subscriptionId}
Headers: Authorization: Bearer {token}
Response: IBill[]
```

#### Get Bills by Date Range
```
GET /api/bills/date-range?startDate=2026-01-01&endDate=2026-12-31
Headers: Authorization: Bearer {token}
Response: IBill[]
```

## Data Models

### SaaSSubscription
```typescript
interface ISaaSSubscription {
  id?: number;
  serviceName: string;          // Required
  description?: string;
  monthlyCost: number;          // Required
  annualCost?: number;
  subscriptionDate: Dayjs;      // Required
  renewalDate?: Dayjs;
  billingCycle: BillingCycle;   // Required
  status: SubscriptionStatus;   // Required
  providerUrl?: string;
  accountEmail?: string;
  accountUsername?: string;
  notes?: string;
  isShared?: boolean;
  createdDate?: Dayjs;
  lastModifiedDate?: Dayjs;
  userId?: number;
}

enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL'
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED'
}
```

### Bill
```typescript
interface IBill {
  id?: number;
  description: string;          // Required
  amount: number;               // Required
  billDate: Dayjs;              // Required
  dueDate?: Dayjs;
  paidDate?: Dayjs;
  status: BillStatus;           // Required
  receiptUrl?: string;
  notes?: string;
  paymentMethod: PaymentMethod; // Required
  isRecurring?: boolean;
  createdDate?: Dayjs;
  lastModifiedDate?: Dayjs;
  userId?: number;
  subscriptionId?: number;
  subscriptionName?: string;
}

enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL'
}

enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER'
}
```

## Error Handling Examples

```typescript
import { HttpErrorResponse } from '@angular/common/http';

// Handle subscription creation error
this.subscriptionService.create(subscription).subscribe({
  next: (response) => {
    console.log('Success:', response.body);
  },
  error: (error: HttpErrorResponse) => {
    if (error.status === 400) {
      console.error('Invalid data:', error.error.message);
    } else if (error.status === 401) {
      console.error('Unauthorized. Please log in.');
    } else if (error.status === 403) {
      console.error('Forbidden. You do not have access.');
    } else {
      console.error('Error:', error.message);
    }
  }
});
```

## Performance Tips

1. **Pagination**: Use pagination for large lists
   ```typescript
   const pageable = { page: 0, size: 20 };
   this.subscriptionService.query(pageable);
   ```

2. **Caching**: Cache frequently accessed data
   ```typescript
   private subscriptionsCache = new Map();
   ```

3. **Lazy Loading**: Load data only when needed
   ```typescript
   this.subscriptions$ = this.subscriptionService.queryMy().pipe(
     shareReplay(1)
   );
   ```

## Security Notes

- All endpoints require authentication
- Users can only access their own data
- Sensitive data (passwords) should not be stored in plain text
- Always use HTTPS in production
- Keep JWT tokens secure
- Implement rate limiting on APIs

## Testing

### Unit Test Example
```typescript
import { TestBed } from '@angular/core/testing';
import { SaaSSubscriptionService } from './saas-subscription.service';

describe('SaaSSubscriptionService', () => {
  let service: SaaSSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaaSSubscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

**Last Updated**: April 14, 2026

