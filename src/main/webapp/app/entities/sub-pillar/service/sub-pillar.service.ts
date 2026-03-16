import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubPillar, NewSubPillar } from '../sub-pillar.model';

export type PartialUpdateSubPillar = Partial<ISubPillar> & Pick<ISubPillar, 'id'>;

export type EntityResponseType = HttpResponse<ISubPillar>;
export type EntityArrayResponseType = HttpResponse<ISubPillar[]>;

@Injectable({ providedIn: 'root' })
export class SubPillarService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-pillars');

  create(subPillar: NewSubPillar): Observable<EntityResponseType> {
    return this.http.post<ISubPillar>(this.resourceUrl, subPillar, { observe: 'response' });
  }

  update(subPillar: ISubPillar): Observable<EntityResponseType> {
    return this.http.put<ISubPillar>(`${this.resourceUrl}/${this.getSubPillarIdentifier(subPillar)}`, subPillar, {
      observe: 'response',
    });
  }

  partialUpdate(subPillar: PartialUpdateSubPillar): Observable<EntityResponseType> {
    return this.http.patch<ISubPillar>(`${this.resourceUrl}/${this.getSubPillarIdentifier(subPillar)}`, subPillar, {
      observe: 'response',
    });
  }

  find(id: number, req?: any): Observable<EntityResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillar>(`${this.resourceUrl}/${id}`, { params: options, observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillar[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubPillarIdentifier(subPillar: Pick<ISubPillar, 'id'>): number {
    return subPillar.id;
  }

  compareSubPillar(o1: Pick<ISubPillar, 'id'> | null, o2: Pick<ISubPillar, 'id'> | null): boolean {
    return o1 && o2 ? this.getSubPillarIdentifier(o1) === this.getSubPillarIdentifier(o2) : o1 === o2;
  }

  addSubPillarToCollectionIfMissing<Type extends Pick<ISubPillar, 'id'>>(
    subPillarCollection: Type[],
    ...subPillarsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subPillars: Type[] = subPillarsToCheck.filter(isPresent);
    if (subPillars.length > 0) {
      const subPillarCollectionIdentifiers = subPillarCollection.map(subPillarItem =>
        this.getSubPillarIdentifier(subPillarItem),
      );
      const subPillarsToAdd = subPillars.filter(subPillarItem => {
        const subPillarIdentifier = this.getSubPillarIdentifier(subPillarItem);
        if (subPillarCollectionIdentifiers.includes(subPillarIdentifier)) {
          return false;
        }
        subPillarCollectionIdentifiers.push(subPillarIdentifier);
        return true;
      });
      return [...subPillarsToAdd, ...subPillarCollection];
    }
    return subPillarCollection;
  }
}
