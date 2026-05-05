import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface IMapboxConfig {
  enabled: boolean;
  styleUrl: string;
  publicToken: string | null;
}

export interface IMapboxPlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

@Injectable({ providedIn: 'root' })
export class MapboxIntegrationService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(ApplicationConfigService);
  private readonly baseUrl = this.appConfig.getEndpointFor('api/integrations/mapbox');

  getConfig(): Observable<IMapboxConfig> {
    return this.http.get<IMapboxConfig>(`${this.baseUrl}/config`);
  }

  search(query: string, limit = 5): Observable<IMapboxPlace[]> {
    return this.http.get<IMapboxPlace[]>(`${this.baseUrl}/geocode`, { params: { query, limit } });
  }

  reverse(longitude: number, latitude: number): Observable<IMapboxPlace | null> {
    return this.http.get<IMapboxPlace | null>(`${this.baseUrl}/reverse`, { params: { longitude, latitude } });
  }
}

