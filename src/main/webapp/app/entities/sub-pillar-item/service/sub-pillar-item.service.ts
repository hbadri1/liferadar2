import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubPillarItem, NewSubPillarItem } from '../sub-pillar-item.model';

export type PartialUpdateSubPillarItem = Partial<ISubPillarItem> & Pick<ISubPillarItem, 'id'>;

export type EntityResponseType = HttpResponse<ISubPillarItem>;
export type EntityArrayResponseType = HttpResponse<ISubPillarItem[]>;

@Injectable({ providedIn: 'root' })
export class SubPillarItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-pillar-items');

  create(subPillarItem: NewSubPillarItem): Observable<EntityResponseType> {
    return this.http.post<ISubPillarItem>(this.resourceUrl, subPillarItem, { observe: 'response' });
  }

  update(subPillarItem: ISubPillarItem): Observable<EntityResponseType> {
    return this.http.put<ISubPillarItem>(
      `${this.resourceUrl}/${this.getSubPillarItemIdentifier(subPillarItem)}`,
      subPillarItem,
      { observe: 'response' },
    );
  }

  partialUpdate(subPillarItem: PartialUpdateSubPillarItem): Observable<EntityResponseType> {
    return this.http.patch<ISubPillarItem>(
      `${this.resourceUrl}/${this.getSubPillarItemIdentifier(subPillarItem)}`,
      subPillarItem,
      { observe: 'response' },
    );
  }

  find(id: number, req?: any): Observable<EntityResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillarItem>(`${this.resourceUrl}/${id}`, { params: options, observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillarItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubPillarItemIdentifier(subPillarItem: Pick<ISubPillarItem, 'id'>): number {
    return subPillarItem.id;
  }

  compareSubPillarItem(o1: Pick<ISubPillarItem, 'id'> | null, o2: Pick<ISubPillarItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getSubPillarItemIdentifier(o1) === this.getSubPillarItemIdentifier(o2) : o1 === o2;
  }

  addSubPillarItemToCollectionIfMissing<Type extends Pick<ISubPillarItem, 'id'>>(
    subPillarItemCollection: Type[],
    ...subPillarItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subPillarItems: Type[] = subPillarItemsToCheck.filter(isPresent);
    if (subPillarItems.length > 0) {
      const subPillarItemCollectionIdentifiers = subPillarItemCollection.map(subPillarItemItem =>
        this.getSubPillarItemIdentifier(subPillarItemItem),
      );
      const subPillarItemsToAdd = subPillarItems.filter(subPillarItemItem => {
        const subPillarItemIdentifier = this.getSubPillarItemIdentifier(subPillarItemItem);
        if (subPillarItemCollectionIdentifiers.includes(subPillarItemIdentifier)) {
          return false;
        }
        subPillarItemCollectionIdentifiers.push(subPillarItemIdentifier);
        return true;
      });
      return [...subPillarItemsToAdd, ...subPillarItemCollection];
    }
    return subPillarItemCollection;
  }
}
