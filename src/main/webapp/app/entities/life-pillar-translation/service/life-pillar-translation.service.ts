import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILifePillarTranslation, NewLifePillarTranslation } from '../life-pillar-translation.model';

export type PartialUpdateLifePillarTranslation = Partial<ILifePillarTranslation> & Pick<ILifePillarTranslation, 'id'>;

export type EntityResponseType = HttpResponse<ILifePillarTranslation>;
export type EntityArrayResponseType = HttpResponse<ILifePillarTranslation[]>;

@Injectable({ providedIn: 'root' })
export class LifePillarTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/life-pillar-translations');

  create(lifePillarTranslation: NewLifePillarTranslation): Observable<EntityResponseType> {
    return this.http.post<ILifePillarTranslation>(this.resourceUrl, lifePillarTranslation, { observe: 'response' });
  }

  update(lifePillarTranslation: ILifePillarTranslation): Observable<EntityResponseType> {
    return this.http.put<ILifePillarTranslation>(
      `${this.resourceUrl}/${this.getLifePillarTranslationIdentifier(lifePillarTranslation)}`,
      lifePillarTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(lifePillarTranslation: PartialUpdateLifePillarTranslation): Observable<EntityResponseType> {
    return this.http.patch<ILifePillarTranslation>(
      `${this.resourceUrl}/${this.getLifePillarTranslationIdentifier(lifePillarTranslation)}`,
      lifePillarTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ILifePillarTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ILifePillarTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLifePillarTranslationIdentifier(lifePillarTranslation: Pick<ILifePillarTranslation, 'id'>): number {
    return lifePillarTranslation.id;
  }

  compareLifePillarTranslation(o1: Pick<ILifePillarTranslation, 'id'> | null, o2: Pick<ILifePillarTranslation, 'id'> | null): boolean {
    return o1 && o2 ? this.getLifePillarTranslationIdentifier(o1) === this.getLifePillarTranslationIdentifier(o2) : o1 === o2;
  }

  addLifePillarTranslationToCollectionIfMissing<Type extends Pick<ILifePillarTranslation, 'id'>>(
    lifePillarTranslationCollection: Type[],
    ...lifePillarTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const lifePillarTranslations: Type[] = lifePillarTranslationsToCheck.filter(isPresent);
    if (lifePillarTranslations.length > 0) {
      const lifePillarTranslationCollectionIdentifiers = lifePillarTranslationCollection.map(lifePillarTranslationItem =>
        this.getLifePillarTranslationIdentifier(lifePillarTranslationItem),
      );
      const lifePillarTranslationsToAdd = lifePillarTranslations.filter(lifePillarTranslationItem => {
        const lifePillarTranslationIdentifier = this.getLifePillarTranslationIdentifier(lifePillarTranslationItem);
        if (lifePillarTranslationCollectionIdentifiers.includes(lifePillarTranslationIdentifier)) {
          return false;
        }
        lifePillarTranslationCollectionIdentifiers.push(lifePillarTranslationIdentifier);
        return true;
      });
      return [...lifePillarTranslationsToAdd, ...lifePillarTranslationCollection];
    }
    return lifePillarTranslationCollection;
  }
}
