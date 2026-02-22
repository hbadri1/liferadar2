import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubLifePillarItemTranslation, NewSubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';

export type PartialUpdateSubLifePillarItemTranslation = Partial<ISubLifePillarItemTranslation> & Pick<ISubLifePillarItemTranslation, 'id'>;

export type EntityResponseType = HttpResponse<ISubLifePillarItemTranslation>;
export type EntityArrayResponseType = HttpResponse<ISubLifePillarItemTranslation[]>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarItemTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-life-pillar-item-translations');

  create(subLifePillarItemTranslation: NewSubLifePillarItemTranslation): Observable<EntityResponseType> {
    return this.http.post<ISubLifePillarItemTranslation>(this.resourceUrl, subLifePillarItemTranslation, { observe: 'response' });
  }

  update(subLifePillarItemTranslation: ISubLifePillarItemTranslation): Observable<EntityResponseType> {
    return this.http.put<ISubLifePillarItemTranslation>(
      `${this.resourceUrl}/${this.getSubLifePillarItemTranslationIdentifier(subLifePillarItemTranslation)}`,
      subLifePillarItemTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(subLifePillarItemTranslation: PartialUpdateSubLifePillarItemTranslation): Observable<EntityResponseType> {
    return this.http.patch<ISubLifePillarItemTranslation>(
      `${this.resourceUrl}/${this.getSubLifePillarItemTranslationIdentifier(subLifePillarItemTranslation)}`,
      subLifePillarItemTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubLifePillarItemTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubLifePillarItemTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubLifePillarItemTranslationIdentifier(subLifePillarItemTranslation: Pick<ISubLifePillarItemTranslation, 'id'>): number {
    return subLifePillarItemTranslation.id;
  }

  compareSubLifePillarItemTranslation(
    o1: Pick<ISubLifePillarItemTranslation, 'id'> | null,
    o2: Pick<ISubLifePillarItemTranslation, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getSubLifePillarItemTranslationIdentifier(o1) === this.getSubLifePillarItemTranslationIdentifier(o2) : o1 === o2;
  }

  addSubLifePillarItemTranslationToCollectionIfMissing<Type extends Pick<ISubLifePillarItemTranslation, 'id'>>(
    subLifePillarItemTranslationCollection: Type[],
    ...subLifePillarItemTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subLifePillarItemTranslations: Type[] = subLifePillarItemTranslationsToCheck.filter(isPresent);
    if (subLifePillarItemTranslations.length > 0) {
      const subLifePillarItemTranslationCollectionIdentifiers = subLifePillarItemTranslationCollection.map(
        subLifePillarItemTranslationItem => this.getSubLifePillarItemTranslationIdentifier(subLifePillarItemTranslationItem),
      );
      const subLifePillarItemTranslationsToAdd = subLifePillarItemTranslations.filter(subLifePillarItemTranslationItem => {
        const subLifePillarItemTranslationIdentifier = this.getSubLifePillarItemTranslationIdentifier(subLifePillarItemTranslationItem);
        if (subLifePillarItemTranslationCollectionIdentifiers.includes(subLifePillarItemTranslationIdentifier)) {
          return false;
        }
        subLifePillarItemTranslationCollectionIdentifiers.push(subLifePillarItemTranslationIdentifier);
        return true;
      });
      return [...subLifePillarItemTranslationsToAdd, ...subLifePillarItemTranslationCollection];
    }
    return subLifePillarItemTranslationCollection;
  }
}
