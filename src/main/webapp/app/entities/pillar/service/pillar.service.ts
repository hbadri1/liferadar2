import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPillar, NewPillar } from '../pillar.model';

export type PartialUpdatePillar = Partial<IPillar> & Pick<IPillar, 'id'>;
export interface SuggestedPillarImportResult {
  pillarsCreated: number;
  subPillarsCreated: number;
  subPillarItemsCreated: number;
  translationsCreated: number;
}

export type EntityResponseType = HttpResponse<IPillar>;
export type EntityArrayResponseType = HttpResponse<IPillar[]>;
export type SuggestedImportResponseType = HttpResponse<SuggestedPillarImportResult>;

@Injectable({ providedIn: 'root' })
export class PillarService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/pillars');

  create(pillar: NewPillar): Observable<EntityResponseType> {
    return this.http.post<IPillar>(this.resourceUrl, pillar, { observe: 'response' });
  }

  update(pillar: IPillar): Observable<EntityResponseType> {
    return this.http.put<IPillar>(`${this.resourceUrl}/${this.getPillarIdentifier(pillar)}`, pillar, {
      observe: 'response',
    });
  }

  partialUpdate(pillar: PartialUpdatePillar): Observable<EntityResponseType> {
    return this.http.patch<IPillar>(`${this.resourceUrl}/${this.getPillarIdentifier(pillar)}`, pillar, {
      observe: 'response',
    });
  }

  find(id: number, req?: any): Observable<EntityResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPillar>(`${this.resourceUrl}/${id}`, { params: options, observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPillar[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  loadSuggested(): Observable<SuggestedImportResponseType> {
    return this.http.post<SuggestedPillarImportResult>(`${this.resourceUrl}/load-suggested`, {}, { observe: 'response' });
  }

  getPillarIdentifier(pillar: Pick<IPillar, 'id'>): number {
    return pillar.id;
  }

  comparePillar(o1: Pick<IPillar, 'id'> | null, o2: Pick<IPillar, 'id'> | null): boolean {
    return o1 && o2 ? this.getPillarIdentifier(o1) === this.getPillarIdentifier(o2) : o1 === o2;
  }

  addPillarToCollectionIfMissing<Type extends Pick<IPillar, 'id'>>(
    pillarCollection: Type[],
    ...pillarsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const pillars: Type[] = pillarsToCheck.filter(isPresent);
    if (pillars.length > 0) {
      const pillarCollectionIdentifiers = pillarCollection.map(pillarItem => this.getPillarIdentifier(pillarItem));
      const pillarsToAdd = pillars.filter(pillarItem => {
        const pillarIdentifier = this.getPillarIdentifier(pillarItem);
        if (pillarCollectionIdentifiers.includes(pillarIdentifier)) {
          return false;
        }
        pillarCollectionIdentifiers.push(pillarIdentifier);
        return true;
      });
      return [...pillarsToAdd, ...pillarCollection];
    }
    return pillarCollection;
  }
}
