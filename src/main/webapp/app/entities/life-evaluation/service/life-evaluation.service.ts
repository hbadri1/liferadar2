import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ILifeEvaluation, NewLifeEvaluation } from '../life-evaluation.model';

export type PartialUpdateLifeEvaluation = Partial<ILifeEvaluation> & Pick<ILifeEvaluation, 'id'>;

type RestOf<T extends ILifeEvaluation | NewLifeEvaluation> = Omit<T, 'evaluationDate' | 'reminderAt'> & {
  evaluationDate?: string | null;
  reminderAt?: string | null;
};

export type RestLifeEvaluation = RestOf<ILifeEvaluation>;

export type NewRestLifeEvaluation = RestOf<NewLifeEvaluation>;

export type PartialUpdateRestLifeEvaluation = RestOf<PartialUpdateLifeEvaluation>;

export type EntityResponseType = HttpResponse<ILifeEvaluation>;
export type EntityArrayResponseType = HttpResponse<ILifeEvaluation[]>;

@Injectable({ providedIn: 'root' })
export class LifeEvaluationService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/life-evaluations');

  create(lifeEvaluation: NewLifeEvaluation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lifeEvaluation);
    return this.http
      .post<RestLifeEvaluation>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(lifeEvaluation: ILifeEvaluation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lifeEvaluation);
    return this.http
      .put<RestLifeEvaluation>(`${this.resourceUrl}/${this.getLifeEvaluationIdentifier(lifeEvaluation)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(lifeEvaluation: PartialUpdateLifeEvaluation): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lifeEvaluation);
    return this.http
      .patch<RestLifeEvaluation>(`${this.resourceUrl}/${this.getLifeEvaluationIdentifier(lifeEvaluation)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestLifeEvaluation>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLifeEvaluation[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLifeEvaluationIdentifier(lifeEvaluation: Pick<ILifeEvaluation, 'id'>): number {
    return lifeEvaluation.id;
  }

  compareLifeEvaluation(o1: Pick<ILifeEvaluation, 'id'> | null, o2: Pick<ILifeEvaluation, 'id'> | null): boolean {
    return o1 && o2 ? this.getLifeEvaluationIdentifier(o1) === this.getLifeEvaluationIdentifier(o2) : o1 === o2;
  }

  addLifeEvaluationToCollectionIfMissing<Type extends Pick<ILifeEvaluation, 'id'>>(
    lifeEvaluationCollection: Type[],
    ...lifeEvaluationsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const lifeEvaluations: Type[] = lifeEvaluationsToCheck.filter(isPresent);
    if (lifeEvaluations.length > 0) {
      const lifeEvaluationCollectionIdentifiers = lifeEvaluationCollection.map(lifeEvaluationItem =>
        this.getLifeEvaluationIdentifier(lifeEvaluationItem),
      );
      const lifeEvaluationsToAdd = lifeEvaluations.filter(lifeEvaluationItem => {
        const lifeEvaluationIdentifier = this.getLifeEvaluationIdentifier(lifeEvaluationItem);
        if (lifeEvaluationCollectionIdentifiers.includes(lifeEvaluationIdentifier)) {
          return false;
        }
        lifeEvaluationCollectionIdentifiers.push(lifeEvaluationIdentifier);
        return true;
      });
      return [...lifeEvaluationsToAdd, ...lifeEvaluationCollection];
    }
    return lifeEvaluationCollection;
  }

  protected convertDateFromClient<T extends ILifeEvaluation | NewLifeEvaluation | PartialUpdateLifeEvaluation>(
    lifeEvaluation: T,
  ): RestOf<T> {
    return {
      ...lifeEvaluation,
      evaluationDate: this.normalizeDateToString(lifeEvaluation.evaluationDate, DATE_FORMAT),
      reminderAt: this.normalizeDateTimeToString(lifeEvaluation.reminderAt),
    };
  }

  private normalizeDateToString(date: any, format: string = DATE_FORMAT): string | null {
    if (!date) return null;
    // If it's already a dayjs object, format it
    if (typeof date.format === 'function') {
      return date.format(format);
    }
    // If it's a string, return as-is (already formatted)
    if (typeof date === 'string') {
      return date;
    }
    // If it's a Date object, convert to dayjs first
    if (date instanceof Date) {
      return dayjs(date).format(format);
    }
    // Otherwise try to parse it as dayjs
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format(format) : null;
  }

  private normalizeDateTimeToString(date: any): string | null {
    if (!date) return null;
    // If it's a dayjs object, call toJSON
    if (typeof date.toJSON === 'function') {
      return date.toJSON();
    }
    // If it's a string, return as-is
    if (typeof date === 'string') {
      return date;
    }
    // If it's a Date object, call toISOString directly
    if (date instanceof Date) {
      return date.toISOString();
    }
    // Otherwise try to parse it as dayjs
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.toJSON() : null;
  }

  protected convertDateFromServer(restLifeEvaluation: RestLifeEvaluation): ILifeEvaluation {
    return {
      ...restLifeEvaluation,
      evaluationDate: restLifeEvaluation.evaluationDate ? dayjs(restLifeEvaluation.evaluationDate) : undefined,
      reminderAt: restLifeEvaluation.reminderAt ? dayjs(restLifeEvaluation.reminderAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestLifeEvaluation>): HttpResponse<ILifeEvaluation> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestLifeEvaluation[]>): HttpResponse<ILifeEvaluation[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
