export interface INotificationDelivery {
  channel: string;
  status: string;
  attemptCount: number;
  lastAttemptAt?: string | null;
  deliveredAt?: string | null;
  failureReason?: string | null;
}

export interface INotification {
  id: number;
  type?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  title: string;
  message: string;
  actionUrl?: string | null;
  status?: string | null;
  readAt?: string | null;
  createdDate?: string | null;
  deliveries: INotificationDelivery[];
}

export interface IUnreadNotificationCount {
  count: number;
}

export interface IReadAllNotificationsResponse {
  updated: number;
}

