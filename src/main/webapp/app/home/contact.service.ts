import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from 'app/core/config/application-config.service';

export interface ContactMessage {
  name: string;
  email?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  send(contact: ContactMessage): Observable<void> {
    return this.http.post<void>(this.applicationConfigService.getEndpointFor('api/contact'), contact);
  }
}

