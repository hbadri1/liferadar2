import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PremiumInterestPayload {
  email: string;
  feedback?: string;
  source?: string;
}

export interface PremiumInterestResponse {
  id: number;
  email: string;
  feedback?: string;
  source?: string;
  createdDate: string;
  userLogin?: string;
}

/**
 * Service for submitting premium early-access interest registrations.
 */
@Injectable({ providedIn: 'root' })
export class PremiumInterestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/premium-interests';

  submit(payload: PremiumInterestPayload): Observable<PremiumInterestResponse> {
    return this.http.post<PremiumInterestResponse>(this.apiUrl, payload);
  }

  /** Admin: retrieve all early-access registrations (ROLE_ADMIN only). */
  getAll(): Observable<PremiumInterestResponse[]> {
    return this.http.get<PremiumInterestResponse[]>('/api/admin/premium-interests');
  }
}
