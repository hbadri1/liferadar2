import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { ITickTickAuthorizeUrlResponse, ITodoAppConfigUpdate, ITodoAppUserConfig } from './todoapps.model';

export type TodoAppConfigArrayResponseType = HttpResponse<ITodoAppUserConfig[]>;
export type TodoAppConfigResponseType = HttpResponse<ITodoAppUserConfig>;
export type TickTickAuthorizeUrlResponseType = HttpResponse<ITickTickAuthorizeUrlResponse>;
export type TickTickDisconnectResponseType = HttpResponse<{ success: boolean; message: string }>;

@Injectable({ providedIn: 'root' })
export class TodoAppsService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/todoapps/configs');
  private readonly todoAppsResourceUrl = this.applicationConfigService.getEndpointFor('api/todoapps');

  query(): Observable<TodoAppConfigArrayResponseType> {
    return this.http.get<ITodoAppUserConfig[]>(this.resourceUrl, { observe: 'response' });
  }

  update(provider: string, payload: ITodoAppConfigUpdate): Observable<TodoAppConfigResponseType> {
    return this.http.put<ITodoAppUserConfig>(`${this.resourceUrl}/${provider}`, payload, { observe: 'response' });
  }

  getTickTickAuthorizeUrl(): Observable<TickTickAuthorizeUrlResponseType> {
    return this.http.get<ITickTickAuthorizeUrlResponse>(`${this.todoAppsResourceUrl}/ticktick/authorize-url`, { observe: 'response' });
  }

  disconnectTickTick(): Observable<TickTickDisconnectResponseType> {
    return this.http.post<{ success: boolean; message: string }>(`${this.todoAppsResourceUrl}/ticktick/disconnect`, {}, { observe: 'response' });
  }
}

