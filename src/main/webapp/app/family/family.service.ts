import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FamilyInfo } from './family.models';

export interface UpdateFamilyInfoRequest {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class FamilyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/family';

  getFamilyInfo(): Observable<FamilyInfo> {
    return this.http.get<FamilyInfo>(`${this.apiUrl}/info`);
  }

  updateFamilyInfo(request: UpdateFamilyInfoRequest): Observable<FamilyInfo> {
    return this.http.put<FamilyInfo>(`${this.apiUrl}/info`, request);
  }
}
