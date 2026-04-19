import dayjs from 'dayjs/esm';

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER',
}

export interface IBill {
  id?: number;
  description: string;
  amount: number;
  billDate: dayjs.Dayjs;
  dueDate?: dayjs.Dayjs | null;
  paidDate?: dayjs.Dayjs | null;
  status: BillStatus;
  receiptUrl?: string | null;
  notes?: string | null;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean | null;
  createdDate?: dayjs.Dayjs | null;
  lastModifiedDate?: dayjs.Dayjs | null;
  ownerId?: number | null;
  subscriptionId?: number | null;
  subscriptionName?: string | null;
}

export type NewBill = Omit<IBill, 'id'>;

export interface BillMetrics {
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  overdueBills: number;
  cancelledBills: number;
  totalBillAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageBillAmount: number;
}

