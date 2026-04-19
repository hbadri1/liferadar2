# Bills & SaaS Subscriptions Management Feature

## Overview

The Bills & SaaS Subscriptions Management feature is a comprehensive solution for tracking and managing SaaS subscriptions and bills within the Liferadar application. It provides users with tools to monitor subscription costs, track billing dates, and manage their financial obligations.

## Features

### Subscription Management
- **Create Subscriptions**: Add new SaaS subscriptions with details like service name, cost, billing cycle, and renewal dates
- **Update Subscriptions**: Modify subscription details at any time
- **Delete Subscriptions**: Remove subscriptions from your account
- **Status Tracking**: Track subscription status (Active, Paused, Cancelled, Pending, Expired)
- **Renewal Alerts**: Get notified about upcoming renewals within the next 30 days
- **Cost Analysis**: View total monthly and annual costs for all active subscriptions

### Bill Management
- **Create Bills**: Record bills with detailed information including amounts, due dates, and payment methods
- **Update Bills**: Modify bill information
- **Delete Bills**: Remove bills from your records
- **Mark as Paid**: Quickly mark bills as paid
- **Status Tracking**: Track bill status (Pending, Paid, Overdue, Cancelled, Partial)
- **Payment Method Recording**: Store payment method used for each bill
- **Receipt Storage**: Link receipt URLs to bills for future reference

### Dashboard & Analytics
- **Metrics Overview**: View key metrics like total subscriptions, active subscriptions, and total costs
- **Bill Analytics**: See total bills, paid amount, pending amount, and overdue amount
- **Upcoming Renewals**: Quick view of subscriptions renewing soon
- **Overdue Bills Alert**: Notification system for overdue bills
- **Financial Summary**: Comprehensive overview of your subscription and bill finances

## Architecture

### Backend Components

#### Domain Models
- **SaaSSubscription**: Represents a SaaS subscription with all relevant details
- **Bill**: Represents a bill with payment tracking information

#### Services
- **SaaSSubscriptionService**: Business logic for managing subscriptions
- **BillService**: Business logic for managing bills

#### Repositories
- **SaaSSubscriptionRepository**: Data access for subscriptions with custom queries
- **BillRepository**: Data access for bills with filtering and analytics queries

#### REST Controllers
- **SaaSSubscriptionResource**: REST API endpoints for subscriptions
- **BillResource**: REST API endpoints for bills

### Frontend Components

#### Services
- **SaaSSubscriptionService**: HTTP client service for subscription API calls
- **BillService**: HTTP client service for bill API calls

#### Components
- **BillsSubscriptionsComponent**: Main dashboard component with tabs for subscriptions, bills, and analytics

#### Models
- **ISaaSSubscription**: TypeScript interface for subscriptions
- **IBill**: TypeScript interface for bills
- **SubscriptionMetrics**: Metrics data transfer object
- **BillMetrics**: Bill metrics data transfer object

## API Endpoints

### SaaS Subscriptions
- `GET /api/saas-subscriptions` - Get all subscriptions (paginated)
- `GET /api/saas-subscriptions/my` - Get current user's subscriptions
- `GET /api/saas-subscriptions/:id` - Get subscription by ID
- `POST /api/saas-subscriptions` - Create new subscription
- `PUT /api/saas-subscriptions/:id` - Update subscription
- `PATCH /api/saas-subscriptions/:id` - Partially update subscription
- `DELETE /api/saas-subscriptions/:id` - Delete subscription
- `GET /api/saas-subscriptions/metrics/dashboard` - Get subscription metrics
- `GET /api/saas-subscriptions/upcoming/renewals?days=30` - Get upcoming renewals

### Bills
- `GET /api/bills` - Get all bills (paginated)
- `GET /api/bills/my` - Get current user's bills
- `GET /api/bills/:id` - Get bill by ID
- `POST /api/bills` - Create new bill
- `PUT /api/bills/:id` - Update bill
- `PATCH /api/bills/:id` - Partially update bill
- `DELETE /api/bills/:id` - Delete bill
- `POST /api/bills/:id/mark-paid` - Mark bill as paid
- `GET /api/bills/metrics/dashboard` - Get bill metrics
- `GET /api/bills/status/pending` - Get pending bills
- `GET /api/bills/status/overdue` - Get overdue bills
- `GET /api/bills/subscription/:subscriptionId` - Get bills for a subscription
- `GET /api/bills/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get bills by date range

## Database Schema

### saas_subscription table
```sql
CREATE TABLE saas_subscription (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  service_name VARCHAR(200) NOT NULL,
  description VARCHAR(800),
  monthly_cost DECIMAL(10,2) NOT NULL,
  annual_cost DECIMAL(10,2),
  subscription_date DATE NOT NULL,
  renewal_date DATE,
  billing_cycle VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  provider_url VARCHAR(500),
  account_email VARCHAR(200),
  account_username VARCHAR(200),
  notes VARCHAR(1000),
  is_shared BOOLEAN DEFAULT false,
  created_date TIMESTAMP,
  last_modified_date TIMESTAMP,
  user_id BIGINT NOT NULL REFERENCES jhi_user(id)
);
```

### bill table
```sql
CREATE TABLE bill (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR(200) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  status VARCHAR(20) NOT NULL,
  receipt_url VARCHAR(500),
  notes VARCHAR(1000),
  payment_method VARCHAR(20) NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  created_date TIMESTAMP,
  last_modified_date TIMESTAMP,
  user_id BIGINT NOT NULL REFERENCES jhi_user(id),
  subscription_id BIGINT REFERENCES saas_subscription(id)
);
```

## Enums

### BillingCycle
- MONTHLY
- QUARTERLY
- SEMI_ANNUAL
- ANNUAL

### SubscriptionStatus
- ACTIVE
- PAUSED
- CANCELLED
- PENDING
- EXPIRED

### BillStatus
- PENDING
- PAID
- OVERDUE
- CANCELLED
- PARTIAL

### PaymentMethod
- CREDIT_CARD
- DEBIT_CARD
- BANK_TRANSFER
- PAYPAL
- OTHER

## Security

All endpoints are secured with role-based access control:
- `ROLE_USER` - Standard user access
- `ROLE_FAMILY_ADMIN` - Family administrator access
- `ROLE_ADMIN` - System administrator access

Users can only view and manage their own subscriptions and bills.

## Usage Examples

### Create a Subscription
```bash
curl -X POST http://localhost:8080/api/saas-subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "serviceName": "Netflix",
    "description": "Video streaming service",
    "monthlyCost": 15.99,
    "subscriptionDate": "2026-01-01",
    "renewalDate": "2026-02-01",
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "accountEmail": "user@example.com"
  }'
```

### Create a Bill
```bash
curl -X POST http://localhost:8080/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Netflix - February 2026",
    "amount": 15.99,
    "billDate": "2026-02-01",
    "dueDate": "2026-02-10",
    "status": "PENDING",
    "paymentMethod": "CREDIT_CARD",
    "subscriptionId": 1
  }'
```

### Get Subscription Metrics
```bash
curl -X GET http://localhost:8080/api/saas-subscriptions/metrics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Mark Bill as Paid
```bash
curl -X POST http://localhost:8080/api/bills/1/mark-paid \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Integration with Notification System

The Bills & Subscriptions module integrates with the notification system to:
- Send reminders for upcoming subscription renewals
- Alert users about overdue bills
- Provide billing notifications based on user preferences

## Performance Considerations

- Subscriptions and bills are paginated for better performance
- Queries use indexes on user_id, status, and date fields
- Metrics are calculated on-demand but optimized with efficient queries
- User-specific filters ensure data privacy and performance

## Future Enhancements

- Recurring bill automation
- CSV export functionality
- Budget alerts and spending limits
- Subscription recommendation engine
- Payment integration with popular payment gateways
- Multi-currency support
- Shared subscription tracking with family members
- Advanced reporting and analytics

## Migration Files

Liquibase migration files have been created:
- `20260414180000_added_entity_SaaSSubscription.xml` - Creates saas_subscription table
- `20260414180001_added_entity_Bill.xml` - Creates bill table and relationships

## Translations

Internationalization support has been added with translations for:
- English (en)
- French (fr) - To be added
- Arabic (ar-ly) - To be added

Translation files:
- `src/main/webapp/i18n/en/billsSubscriptions.json`
- `src/main/webapp/i18n/en/saasSubscription.json`
- `src/main/webapp/i18n/en/bill.json`

## Support and Maintenance

For issues or feature requests related to the Bills & Subscriptions module, please contact the development team.

