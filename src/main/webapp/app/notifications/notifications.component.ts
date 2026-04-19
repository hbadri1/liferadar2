import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { INotification, INotificationDelivery } from './notification.model';
import { NotificationService } from './notification.service';

@Component({
  selector: 'jhi-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  imports: [SharedModule, FormsModule, RouterModule],
})
export default class NotificationsComponent implements OnInit {
  notifications: INotification[] = [];
  unreadOnly = false;
  isLoading = false;

  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.notificationService
      .queryCurrentUser({
        unreadOnly: this.unreadOnly || undefined,
        page: 0,
        size: 100,
        sort: ['createdDate,desc', 'id,desc'],
      })
      .subscribe({
        next: response => {
          this.notifications = response.body ?? [];
          this.notificationService.refreshUnreadCount();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  markAsRead(notification: INotification): void {
    if (notification.status !== 'UNREAD') {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: response => {
        const updated = response.body ?? { ...notification, status: 'READ', readAt: new Date().toISOString() };
        this.notifications = this.notifications.map(item => (item.id === notification.id ? updated : item));
        if (this.unreadOnly) {
          this.notifications = this.notifications.filter(item => item.id !== notification.id);
        }
      },
    });
  }

  markAllAsRead(): void {
    if (!this.notifications.some(notification => notification.status === 'UNREAD')) {
      return;
    }

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        if (this.unreadOnly) {
          this.notifications = [];
          return;
        }
        const now = new Date().toISOString();
        this.notifications = this.notifications.map(notification =>
          notification.status === 'UNREAD' ? { ...notification, status: 'READ', readAt: now } : notification,
        );
      },
    });
  }

  openAction(notification: INotification): void {
    const navigateToAction = (): void => {
      if (!notification.actionUrl) {
        return;
      }
      if (/^https?:\/\//i.test(notification.actionUrl)) {
        window.location.assign(notification.actionUrl);
        return;
      }
      void this.router.navigateByUrl(notification.actionUrl);
    };

    if (notification.status === 'UNREAD') {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: response => {
          const updated = response.body ?? { ...notification, status: 'READ', readAt: new Date().toISOString() };
          this.notifications = this.notifications.map(item => (item.id === notification.id ? updated : item));
          if (this.unreadOnly) {
            this.notifications = this.notifications.filter(item => item.id !== notification.id);
          }
          navigateToAction();
        },
        error: () => navigateToAction(),
      });
      return;
    }

    navigateToAction();
  }

  onUnreadOnlyChange(): void {
    this.load();
  }

  trackById(_index: number, notification: INotification): number {
    return notification.id;
  }

  getDeliveryChannelKey(delivery: INotificationDelivery): string {
    return delivery.channel === 'UI' ? 'PORTAL' : delivery.channel;
  }

  hasUnreadNotifications(): boolean {
    return this.notifications.some(notification => notification.status === 'UNREAD');
  }
}

