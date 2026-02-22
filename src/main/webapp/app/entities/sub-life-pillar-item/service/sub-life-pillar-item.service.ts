import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubLifePillarItem, NewSubLifePillarItem } from '../sub-life-pillar-item.model';

export type PartialUpdateSubLifePillarItem = Partial<ISubLifePillarItem> & Pick<ISubLifePillarItem, 'id'>;

export type EntityResponseType = HttpResponse<ISubLifePillarItem>;
export type EntityArrayResponseType = HttpResponse<ISubLifePillarItem[]>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarItemService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-life-pillar-items');

  create(subLifePillarItem: NewSubLifePillarItem): Observable<EntityResponseType> {
    return this.http.post<ISubLifePillarItem>(this.resourceUrl, subLifePillarItem, { observe: 'response' });
  }

  update(subLifePillarItem: ISubLifePillarItem): Observable<EntityResponseType> {
    return this.http.put<ISubLifePillarItem>(
      `${this.resourceUrl}/${this.getSubLifePillarItemIdentifier(subLifePillarItem)}`,
      subLifePillarItem,
      { observe: 'response' },
    );
  }

  partialUpdate(subLifePillarItem: PartialUpdateSubLifePillarItem): Observable<EntityResponseType> {
    return this.http.patch<ISubLifePillarItem>(
      `${this.resourceUrl}/${this.getSubLifePillarItemIdentifier(subLifePillarItem)}`,
      subLifePillarItem,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubLifePillarItem>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubLifePillarItem[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubLifePillarItemIdentifier(subLifePillarItem: Pick<ISubLifePillarItem, 'id'>): number {
    return subLifePillarItem.id;
  }

  compareSubLifePillarItem(o1: Pick<ISubLifePillarItem, 'id'> | null, o2: Pick<ISubLifePillarItem, 'id'> | null): boolean {
    return o1 && o2 ? this.getSubLifePillarItemIdentifier(o1) === this.getSubLifePillarItemIdentifier(o2) : o1 === o2;
  }

  addSubLifePillarItemToCollectionIfMissing<Type extends Pick<ISubLifePillarItem, 'id'>>(
    subLifePillarItemCollection: Type[],
    ...subLifePillarItemsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subLifePillarItems: Type[] = subLifePillarItemsToCheck.filter(isPresent);
    if (subLifePillarItems.length > 0) {
      const subLifePillarItemCollectionIdentifiers = subLifePillarItemCollection.map(subLifePillarItemItem =>
        this.getSubLifePillarItemIdentifier(subLifePillarItemItem),
      );
      const subLifePillarItemsToAdd = subLifePillarItems.filter(subLifePillarItemItem => {
        const subLifePillarItemIdentifier = this.getSubLifePillarItemIdentifier(subLifePillarItemItem);
        if (subLifePillarItemCollectionIdentifiers.includes(subLifePillarItemIdentifier)) {
          return false;
        }
        subLifePillarItemCollectionIdentifiers.push(subLifePillarItemIdentifier);
        return true;
      });
      return [...subLifePillarItemsToAdd, ...subLifePillarItemCollection];
    }
    return subLifePillarItemCollection;
  }
}
