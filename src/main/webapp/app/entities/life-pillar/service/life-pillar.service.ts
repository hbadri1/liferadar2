import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILifePillar, NewLifePillar } from '../life-pillar.model';

export type PartialUpdateLifePillar = Partial<ILifePillar> & Pick<ILifePillar, 'id'>;

export type EntityResponseType = HttpResponse<ILifePillar>;
export type EntityArrayResponseType = HttpResponse<ILifePillar[]>;

@Injectable({ providedIn: 'root' })
export class LifePillarService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/life-pillars');

  create(lifePillar: NewLifePillar): Observable<EntityResponseType> {
    return this.http.post<ILifePillar>(this.resourceUrl, lifePillar, { observe: 'response' });
  }

  update(lifePillar: ILifePillar): Observable<EntityResponseType> {
    return this.http.put<ILifePillar>(`${this.resourceUrl}/${this.getLifePillarIdentifier(lifePillar)}`, lifePillar, {
      observe: 'response',
    });
  }

  partialUpdate(lifePillar: PartialUpdateLifePillar): Observable<EntityResponseType> {
    return this.http.patch<ILifePillar>(`${this.resourceUrl}/${this.getLifePillarIdentifier(lifePillar)}`, lifePillar, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILifePillar>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILifePillar[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLifePillarIdentifier(lifePillar: Pick<ILifePillar, 'id'>): number {
    return lifePillar.id;
  }

  compareLifePillar(o1: Pick<ILifePillar, 'id'> | null, o2: Pick<ILifePillar, 'id'> | null): boolean {
    return o1 && o2 ? this.getLifePillarIdentifier(o1) === this.getLifePillarIdentifier(o2) : o1 === o2;
  }

  addLifePillarToCollectionIfMissing<Type extends Pick<ILifePillar, 'id'>>(
    lifePillarCollection: Type[],
    ...lifePillarsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const lifePillars: Type[] = lifePillarsToCheck.filter(isPresent);
    if (lifePillars.length > 0) {
      const lifePillarCollectionIdentifiers = lifePillarCollection.map(lifePillarItem => this.getLifePillarIdentifier(lifePillarItem));
      const lifePillarsToAdd = lifePillars.filter(lifePillarItem => {
        const lifePillarIdentifier = this.getLifePillarIdentifier(lifePillarItem);
        if (lifePillarCollectionIdentifiers.includes(lifePillarIdentifier)) {
          return false;
        }
        lifePillarCollectionIdentifiers.push(lifePillarIdentifier);
        return true;
      });
      return [...lifePillarsToAdd, ...lifePillarCollection];
    }
    return lifePillarCollection;
  }
}
