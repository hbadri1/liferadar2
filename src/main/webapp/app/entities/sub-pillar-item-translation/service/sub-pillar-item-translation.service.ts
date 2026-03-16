import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubPillarItemTranslation, NewSubPillarItemTranslation } from '../sub-pillar-item-translation.model';

export type PartialUpdateSubPillarItemTranslation = Partial<ISubPillarItemTranslation> & Pick<ISubPillarItemTranslation, 'id'>;

export type EntityResponseType = HttpResponse<ISubPillarItemTranslation>;
export type EntityArrayResponseType = HttpResponse<ISubPillarItemTranslation[]>;

@Injectable({ providedIn: 'root' })
export class SubPillarItemTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-pillar-item-translations');

  create(subPillarItemTranslation: NewSubPillarItemTranslation): Observable<EntityResponseType> {
    return this.http.post<ISubPillarItemTranslation>(this.resourceUrl, subPillarItemTranslation, { observe: 'response' });
  }

  update(subPillarItemTranslation: ISubPillarItemTranslation): Observable<EntityResponseType> {
    return this.http.put<ISubPillarItemTranslation>(
      `${this.resourceUrl}/${this.getSubPillarItemTranslationIdentifier(subPillarItemTranslation)}`,
      subPillarItemTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(subPillarItemTranslation: PartialUpdateSubPillarItemTranslation): Observable<EntityResponseType> {
    return this.http.patch<ISubPillarItemTranslation>(
      `${this.resourceUrl}/${this.getSubPillarItemTranslationIdentifier(subPillarItemTranslation)}`,
      subPillarItemTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubPillarItemTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillarItemTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubPillarItemTranslationIdentifier(subPillarItemTranslation: Pick<ISubPillarItemTranslation, 'id'>): number {
    return subPillarItemTranslation.id;
  }

  compareSubPillarItemTranslation(
    o1: Pick<ISubPillarItemTranslation, 'id'> | null,
    o2: Pick<ISubPillarItemTranslation, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getSubPillarItemTranslationIdentifier(o1) === this.getSubPillarItemTranslationIdentifier(o2) : o1 === o2;
  }

  addSubPillarItemTranslationToCollectionIfMissing<Type extends Pick<ISubPillarItemTranslation, 'id'>>(
    subPillarItemTranslationCollection: Type[],
    ...subPillarItemTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subPillarItemTranslations: Type[] = subPillarItemTranslationsToCheck.filter(isPresent);
    if (subPillarItemTranslations.length > 0) {
      const subPillarItemTranslationCollectionIdentifiers = subPillarItemTranslationCollection.map(
        subPillarItemTranslationItem => this.getSubPillarItemTranslationIdentifier(subPillarItemTranslationItem),
      );
      const subPillarItemTranslationsToAdd = subPillarItemTranslations.filter(subPillarItemTranslationItem => {
        const subPillarItemTranslationIdentifier = this.getSubPillarItemTranslationIdentifier(subPillarItemTranslationItem);
        if (subPillarItemTranslationCollectionIdentifiers.includes(subPillarItemTranslationIdentifier)) {
          return false;
        }
        subPillarItemTranslationCollectionIdentifiers.push(subPillarItemTranslationIdentifier);
        return true;
      });
      return [...subPillarItemTranslationsToAdd, ...subPillarItemTranslationCollection];
    }
    return subPillarItemTranslationCollection;
  }
}
