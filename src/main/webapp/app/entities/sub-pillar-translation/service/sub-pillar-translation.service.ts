import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISubPillarTranslation, NewSubPillarTranslation } from '../sub-pillar-translation.model';

export type PartialUpdateSubPillarTranslation = Partial<ISubPillarTranslation> & Pick<ISubPillarTranslation, 'id'>;

export type EntityResponseType = HttpResponse<ISubPillarTranslation>;
export type EntityArrayResponseType = HttpResponse<ISubPillarTranslation[]>;

@Injectable({ providedIn: 'root' })
export class SubPillarTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/sub-pillar-translations');

  create(subPillarTranslation: NewSubPillarTranslation): Observable<EntityResponseType> {
    return this.http.post<ISubPillarTranslation>(this.resourceUrl, subPillarTranslation, { observe: 'response' });
  }

  update(subPillarTranslation: ISubPillarTranslation): Observable<EntityResponseType> {
    return this.http.put<ISubPillarTranslation>(
      `${this.resourceUrl}/${this.getSubPillarTranslationIdentifier(subPillarTranslation)}`,
      subPillarTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(subPillarTranslation: PartialUpdateSubPillarTranslation): Observable<EntityResponseType> {
    return this.http.patch<ISubPillarTranslation>(
      `${this.resourceUrl}/${this.getSubPillarTranslationIdentifier(subPillarTranslation)}`,
      subPillarTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<ISubPillarTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<ISubPillarTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getSubPillarTranslationIdentifier(subPillarTranslation: Pick<ISubPillarTranslation, 'id'>): number {
    return subPillarTranslation.id;
  }

  compareSubPillarTranslation(
    o1: Pick<ISubPillarTranslation, 'id'> | null,
    o2: Pick<ISubPillarTranslation, 'id'> | null,
  ): boolean {
    return o1 && o2 ? this.getSubPillarTranslationIdentifier(o1) === this.getSubPillarTranslationIdentifier(o2) : o1 === o2;
  }

  addSubPillarTranslationToCollectionIfMissing<Type extends Pick<ISubPillarTranslation, 'id'>>(
    subPillarTranslationCollection: Type[],
    ...subPillarTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const subPillarTranslations: Type[] = subPillarTranslationsToCheck.filter(isPresent);
    if (subPillarTranslations.length > 0) {
      const subPillarTranslationCollectionIdentifiers = subPillarTranslationCollection.map(subPillarTranslationItem =>
        this.getSubPillarTranslationIdentifier(subPillarTranslationItem),
      );
      const subPillarTranslationsToAdd = subPillarTranslations.filter(subPillarTranslationItem => {
        const subPillarTranslationIdentifier = this.getSubPillarTranslationIdentifier(subPillarTranslationItem);
        if (subPillarTranslationCollectionIdentifiers.includes(subPillarTranslationIdentifier)) {
          return false;
        }
        subPillarTranslationCollectionIdentifiers.push(subPillarTranslationIdentifier);
        return true;
      });
      return [...subPillarTranslationsToAdd, ...subPillarTranslationCollection];
    }
    return subPillarTranslationCollection;
  }
}
