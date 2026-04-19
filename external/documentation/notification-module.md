# Notification module design

## Purpose

This module adds a reusable notification system to Liferadar without coupling billing or subscription code to email sending or UI delivery.

## Package structure

```text
com.atharsense.lr.notification
├── domain
│   ├── Notification.java
│   ├── NotificationDelivery.java
│   └── enumeration
│       ├── NotificationChannelType.java
│       ├── NotificationDeliveryStatus.java
│       ├── NotificationSourceType.java
│       ├── NotificationStatus.java
│       └── NotificationType.java
├── repository
│   ├── NotificationDeliveryRepository.java
│   └── NotificationRepository.java
├── service
│   ├── DefaultNotificationService.java
│   ├── NotificationInboxService.java
│   ├── NotificationScheduler.java
│   ├── NotificationService.java
│   ├── channel
│   │   ├── EmailNotificationChannel.java
│   │   ├── NotificationChannel.java
│   │   └── UiNotificationChannel.java
│   ├── dto
│   │   └── CreateNotificationRequest.java
│   ├── provider
│   │   └── BillingNotificationCandidateProvider.java
│   └── push
│       └── NotificationPushGateway.java
├── web
│   └── rest
│       ├── NotificationResource.java
│       └── vm
│           └── NotificationVM.java
└── websocket
    ├── NotificationWebsocketConfig.java
    └── StompNotificationPushGateway.java
```

## Flow

1. A scheduler runs every midnight using configurable cron and timezone.
2. The scheduler asks `BillingNotificationCandidateProvider` for:
   - subscriptions due for billing
   - bills due today
   - overdue bills
   - upcoming renewals within N days
3. The provider returns candidate records only.
4. `NotificationService` persists `Notification` and `NotificationDelivery` rows first.
5. Delivery is attempted through configured channels.
6. Failed deliveries are retried by a separate retry scheduler.
7. Users read notifications via REST and optionally receive WebSocket pushes.

## Why this is modular

- Billing code does **not** send email or UI messages directly.
- Billing integrations only implement the `BillingNotificationCandidateProvider` contract.
- New channels can be added by implementing `NotificationChannel`.
- Real-time push is optional and disabled by default.

## Data model

### `app_notification`
Stores the notification inbox record for a user.

### `notification_delivery`
Stores delivery attempt state per channel with retry metadata.

## Current REST endpoints

- `GET /api/notifications/my`
- `GET /api/notifications/my/unread-count`
- `PATCH /api/notifications/{id}/read`
- `PATCH /api/notifications/my/read-all`

## Integrating your future billing module

Create a Spring bean implementing `BillingNotificationCandidateProvider` and query your bills/subscriptions tables there. The notification module will automatically use that bean instead of the default no-op provider.

## Optional future extensions

- per-user notification preferences
- SNS / push / SMS channels
- templated email rendering
- notification grouping and digests
- stronger WebSocket auth handshake customization for JWT clients

