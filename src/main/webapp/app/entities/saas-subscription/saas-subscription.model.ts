import dayjs from 'dayjs/esm';

export enum BillingCycle {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
}

export interface ISaaSSubscription {
  id?: number;
  serviceName: string;
  description?: string | null;
  monthlyCost: number;
  annualCost?: number | null;
  subscriptionDate: dayjs.Dayjs;
  renewalDate?: dayjs.Dayjs | null;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
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
  totalSubscriptions: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  averageMonthlyCost: number;
  upcomingRenewalsCount: number;
}

