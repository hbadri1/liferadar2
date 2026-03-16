import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IPillarTranslation, NewPillarTranslation } from '../pillar-translation.model';

export type PartialUpdatePillarTranslation = Partial<IPillarTranslation> & Pick<IPillarTranslation, 'id'>;

export type EntityResponseType = HttpResponse<IPillarTranslation>;
export type EntityArrayResponseType = HttpResponse<IPillarTranslation[]>;

@Injectable({ providedIn: 'root' })
export class PillarTranslationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/pillar-translations');

  create(pillarTranslation: NewPillarTranslation): Observable<EntityResponseType> {
    return this.http.post<IPillarTranslation>(this.resourceUrl, pillarTranslation, { observe: 'response' });
  }

  update(pillarTranslation: IPillarTranslation): Observable<EntityResponseType> {
    return this.http.put<IPillarTranslation>(
      `${this.resourceUrl}/${this.getPillarTranslationIdentifier(pillarTranslation)}`,
      pillarTranslation,
      { observe: 'response' },
    );
  }

  partialUpdate(pillarTranslation: PartialUpdatePillarTranslation): Observable<EntityResponseType> {
    return this.http.patch<IPillarTranslation>(
      `${this.resourceUrl}/${this.getPillarTranslationIdentifier(pillarTranslation)}`,
      pillarTranslation,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IPillarTranslation>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IPillarTranslation[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getPillarTranslationIdentifier(pillarTranslation: Pick<IPillarTranslation, 'id'>): number {
    return pillarTranslation.id;
  }

  comparePillarTranslation(o1: Pick<IPillarTranslation, 'id'> | null, o2: Pick<IPillarTranslation, 'id'> | null): boolean {
    return o1 && o2 ? this.getPillarTranslationIdentifier(o1) === this.getPillarTranslationIdentifier(o2) : o1 === o2;
  }

  addPillarTranslationToCollectionIfMissing<Type extends Pick<IPillarTranslation, 'id'>>(
    pillarTranslationCollection: Type[],
    ...pillarTranslationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const pillarTranslations: Type[] = pillarTranslationsToCheck.filter(isPresent);
    if (pillarTranslations.length > 0) {
      const pillarTranslationCollectionIdentifiers = pillarTranslationCollection.map(pillarTranslationItem =>
        this.getPillarTranslationIdentifier(pillarTranslationItem),
      );
      const pillarTranslationsToAdd = pillarTranslations.filter(pillarTranslationItem => {
        const pillarTranslationIdentifier = this.getPillarTranslationIdentifier(pillarTranslationItem);
        if (pillarTranslationCollectionIdentifiers.includes(pillarTranslationIdentifier)) {
          return false;
        }
        pillarTranslationCollectionIdentifiers.push(pillarTranslationIdentifier);
        return true;
      });
      return [...pillarTranslationsToAdd, ...pillarTranslationCollection];
    }
    return pillarTranslationCollection;
  }
}
