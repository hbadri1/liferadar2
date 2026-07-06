import dayjs from 'dayjs/esm';

export enum DocumentStatus {
  ACTIVE = 'ACTIVE',
  RENEWED = 'RENEWED',
  EXPIRED = 'EXPIRED',
}

export enum RenewalReminderOption {
  ONE_WEEK = 'ONE_WEEK',
  TWENTY_FOUR_HOURS = 'TWENTY_FOUR_HOURS',
}

export interface IMyDocument {
  id?: number;
  name: string;
  documentType?: string | null;
  issuer?: string | null;
  issueDate?: dayjs.Dayjs | null;
  renewalDate: dayjs.Dayjs;
  status: DocumentStatus;
  renewalReminder?: RenewalReminderOption | null;
  notes?: string | null;
  createdDate?: dayjs.Dayjs | null;
  lastModifiedDate?: dayjs.Dayjs | null;
}

export type NewMyDocument = Omit<IMyDocument, 'id'>;

export interface IMyDocumentSummary {
  totalDocuments: number;
  upcomingRenewals: number;
  expiredDocuments: number;
}
