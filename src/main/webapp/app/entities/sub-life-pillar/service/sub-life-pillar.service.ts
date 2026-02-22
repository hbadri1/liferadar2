import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubLifePillar, NewSubLifePillar } from '../sub-life-pillar.model';

export type PartialUpdateSubLifePillar = Partial<ISubLifePillar> & Pick<ISubLifePillar, 'id'>;

export type EntityResponseType = HttpResponse<ISubLifePillar>;
export type EntityArrayResponseType = HttpResponse<ISubLifePillar[]>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-life-pillars');

  create(subLifePillar: NewSubLifePillar): Observable<EntityResponseType> {
    return this.http.post<ISubLifePillar>(this.resourceUrl, subLifePillar, { observe: 'response' });
  }

  update(subLifePillar: ISubLifePillar): Observable<EntityResponseType> {
    return this.http.put<ISubLifePillar>(`${this.resourceUrl}/${this.getSubLifePillarIdentifier(subLifePillar)}`, subLifePillar, {
      observe: 'response',
    });
  }

  partialUpdate(subLifePillar: PartialUpdateSubLifePillar): Observable<EntityResponseType> {
    return this.http.patch<ISubLifePillar>(`${this.resourceUrl}/${this.getSubLifePillarIdentifier(subLifePillar)}`, subLifePillar, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubLifePillar>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubLifePillar[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubLifePillarIdentifier(subLifePillar: Pick<ISubLifePillar, 'id'>): number {
    return subLifePillar.id;
  }

  compareSubLifePillar(o1: Pick<ISubLifePillar, 'id'> | null, o2: Pick<ISubLifePillar, 'id'> | null): boolean {
    return o1 && o2 ? this.getSubLifePillarIdentifier(o1) === this.getSubLifePillarIdentifier(o2) : o1 === o2;
  }

  addSubLifePillarToCollectionIfMissing<Type extends Pick<ISubLifePillar, 'id'>>(
    subLifePillarCollection: Type[],
    ...subLifePillarsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subLifePillars: Type[] = subLifePillarsToCheck.filter(isPresent);
    if (subLifePillars.length > 0) {
      const subLifePillarCollectionIdentifiers = subLifePillarCollection.map(subLifePillarItem =>
        this.getSubLifePillarIdentifier(subLifePillarItem),
      );
      const subLifePillarsToAdd = subLifePillars.filter(subLifePillarItem => {
        const subLifePillarIdentifier = this.getSubLifePillarIdentifier(subLifePillarItem);
        if (subLifePillarCollectionIdentifiers.includes(subLifePillarIdentifier)) {
          return false;
        }
        subLifePillarCollectionIdentifiers.push(subLifePillarIdentifier);
        return true;
      });
      return [...subLifePillarsToAdd, ...subLifePillarCollection];
    }
    return subLifePillarCollection;
  }
}
