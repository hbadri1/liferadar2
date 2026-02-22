import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubLifePillarTranslation, NewSubLifePillarTranslation } from '../sub-life-pillar-translation.model';

export type PartialUpdateSubLifePillarTranslation = Partial<ISubLifePillarTranslation> & Pick<ISubLifePillarTranslation, 'id'>;

export type EntityResponseType = HttpResponse<ISubLifePillarTranslation>;
export type EntityArrayResponseType = HttpResponse<ISubLifePillarTranslation[]>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-life-pillar-translations');

  create(subLifePillarTranslation: NewSubLifePillarTranslation): Observable<EntityResponseType> {
    return this.http.post<ISubLifePillarTranslation>(this.resourceUrl, subLifePillarTranslation, { observe: 'response' });
  }

  update(subLifePillarTranslation: ISubLifePillarTranslation): Observable<EntityResponseType> {
    return this.http.put<ISubLifePillarTranslation>(
      `${this.resourceUrl}/${this.getSubLifePillarTranslationIdentifier(subLifePillarTranslation)}`,
      subLifePillarTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(subLifePillarTranslation: PartialUpdateSubLifePillarTranslation): Observable<EntityResponseType> {
    return this.http.patch<ISubLifePillarTranslation>(
      `${this.resourceUrl}/${this.getSubLifePillarTranslationIdentifier(subLifePillarTranslation)}`,
      subLifePillarTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubLifePillarTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubLifePillarTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubLifePillarTranslationIdentifier(subLifePillarTranslation: Pick<ISubLifePillarTranslation, 'id'>): number {
    return subLifePillarTranslation.id;
  }

  compareSubLifePillarTranslation(
    o1: Pick<ISubLifePillarTranslation, 'id'> | null,
    o2: Pick<ISubLifePillarTranslation, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getSubLifePillarTranslationIdentifier(o1) === this.getSubLifePillarTranslationIdentifier(o2) : o1 === o2;
  }

  addSubLifePillarTranslationToCollectionIfMissing<Type extends Pick<ISubLifePillarTranslation, 'id'>>(
    subLifePillarTranslationCollection: Type[],
    ...subLifePillarTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subLifePillarTranslations: Type[] = subLifePillarTranslationsToCheck.filter(isPresent);
    if (subLifePillarTranslations.length > 0) {
      const subLifePillarTranslationCollectionIdentifiers = subLifePillarTranslationCollection.map(subLifePillarTranslationItem =>
        this.getSubLifePillarTranslationIdentifier(subLifePillarTranslationItem),
      );
      const subLifePillarTranslationsToAdd = subLifePillarTranslations.filter(subLifePillarTranslationItem => {
        const subLifePillarTranslationIdentifier = this.getSubLifePillarTranslationIdentifier(subLifePillarTranslationItem);
        if (subLifePillarTranslationCollectionIdentifiers.includes(subLifePillarTranslationIdentifier)) {
          return false;
        }
        subLifePillarTranslationCollectionIdentifiers.push(subLifePillarTranslationIdentifier);
        return true;
      });
      return [...subLifePillarTranslationsToAdd, ...subLifePillarTranslationCollection];
    }
    return subLifePillarTranslationCollection;
  }
}
