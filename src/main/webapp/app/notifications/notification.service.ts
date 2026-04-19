import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { INotification, IReadAllNotificationsResponse, IUnreadNotificationCount } from './notification.model';

export type EntityArrayResponseType = HttpResponse<INotification[]>;
export type EntityResponseType = HttpResponse<INotification>;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly unreadCountSignal = signal(0);

  readonly unreadCount = this.unreadCountSignal.asReadonly();
  readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/notifications');

  queryCurrentUser(req?: Record<string, unknown>): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req ?? {});
    return this.http.get<INotification[]>(`${this.resourceUrl}/my`, { params: options, observe: 'response' });
  }

  getUnreadCount(): Observable<IUnreadNotificationCount> {
    return this.http.get<IUnreadNotificationCount>(`${this.resourceUrl}/my/unread-count`);
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: response => this.unreadCountSignal.set(response.count ?? 0),
      error: () => undefined,
    });
  }

  markAsRead(id: number): Observable<EntityResponseType> {
    return this.http.patch<INotification>(`${this.resourceUrl}/${id}/read`, {}, { observe: 'response' }).pipe(
      tap(response => {
        if (response.body?.status === 'READ') {
          this.unreadCountSignal.update(count => Math.max(count - 1, 0));
        }
      }),
    );
  }

  markAllAsRead(): Observable<IReadAllNotificationsResponse> {
    return this.http.patch<IReadAllNotificationsResponse>(`${this.resourceUrl}/my/read-all`, {}).pipe(
      tap(() => this.unreadCountSignal.set(0)),
    );
  }

  resetUnreadCount(): void {
    this.unreadCountSignal.set(0);
  }
}

