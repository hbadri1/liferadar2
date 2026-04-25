import dayjs from 'dayjs/esm';

export enum BillingCycle {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum SubscriptionStatus {
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
}

export enum RenewalReminderOption {
  ONE_WEEK = 'ONE_WEEK',
  TWENTY_FOUR_HOURS = 'TWENTY_FOUR_HOURS',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

export interface ISaaSSubscription {
  id?: number;
  serviceName: string;
  description?: string | null;
  monthlyCost: number;
  currency: string;
  annualCost?: number | null;
  billDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  paidDate?: dayjs.Dayjs | null;
  subscriptionDate: dayjs.Dayjs;
  renewalDate?: dayjs.Dayjs | null;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  autoRenewal?: boolean | null;
  manualRenewal?: boolean | null;
  renewalReminder?: RenewalReminderOption | null;
  receiptUrl?: string | null;
  paymentMethod?: PaymentMethod | null;
  providerUrl?: string | null;
  accountEmail?: string | null;
  accountUsername?: string | null;
  notes?: string | null;
  isShared?: boolean | null;
  createdDate?: dayjs.Dayjs | null;
  lastModifiedDate?: dayjs.Dayjs | null;
  ownerId?: number | null;
}

export type NewSaaSSubscription = Omit<ISaaSSubscription, 'id'>;

export interface SubscriptionMetrics {
  totalExpenses: number;
  activeExpenses: number;
  pendingExpenses: number;
  overdueExpenses: number;
  paidExpenses: number;
  cancelledExpenses: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  averageMonthlyCost: number;
  upcomingRenewalsCount: number;
}
