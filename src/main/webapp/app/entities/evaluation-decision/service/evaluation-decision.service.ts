import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IEvaluationDecision, NewEvaluationDecision } from '../evaluation-decision.model';

export type PartialUpdateEvaluationDecision = Partial<IEvaluationDecision> & Pick<IEvaluationDecision, 'id'>;

type RestOf<T extends IEvaluationDecision | NewEvaluationDecision> = Omit<T, 'date'> & {
  date?: string | null;
};

export type RestEvaluationDecision = RestOf<IEvaluationDecision>;

export type NewRestEvaluationDecision = RestOf<NewEvaluationDecision>;

export type PartialUpdateRestEvaluationDecision = RestOf<PartialUpdateEvaluationDecision>;

export type EntityResponseType = HttpResponse<IEvaluationDecision>;
export type EntityArrayResponseType = HttpResponse<IEvaluationDecision[]>;

@Injectable({ providedIn: 'root' })
export class EvaluationDecisionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/evaluation-decisions');

  create(evaluationDecision: NewEvaluationDecision): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(evaluationDecision);
    return this.http
      .post<RestEvaluationDecision>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(evaluationDecision: IEvaluationDecision): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(evaluationDecision);
    return this.http
      .put<RestEvaluationDecision>(`${this.resourceUrl}/${this.getEvaluationDecisionIdentifier(evaluationDecision)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(evaluationDecision: PartialUpdateEvaluationDecision): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(evaluationDecision);
    return this.http
      .patch<RestEvaluationDecision>(`${this.resourceUrl}/${this.getEvaluationDecisionIdentifier(evaluationDecision)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestEvaluationDecision>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestEvaluationDecision[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getEvaluationDecisionIdentifier(evaluationDecision: Pick<IEvaluationDecision, 'id'>): number {
    return evaluationDecision.id;
  }

  compareEvaluationDecision(o1: Pick<IEvaluationDecision, 'id'> | null, o2: Pick<IEvaluationDecision, 'id'> | null): boolean {
    return o1 && o2 ? this.getEvaluationDecisionIdentifier(o1) === this.getEvaluationDecisionIdentifier(o2) : o1 === o2;
  }

  addEvaluationDecisionToCollectionIfMissing<Type extends Pick<IEvaluationDecision, 'id'>>(
    evaluationDecisionCollection: Type[],
    ...evaluationDecisionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const evaluationDecisions: Type[] = evaluationDecisionsToCheck.filter(isPresent);
    if (evaluationDecisions.length > 0) {
      const evaluationDecisionCollectionIdentifiers = evaluationDecisionCollection.map(evaluationDecisionItem =>
        this.getEvaluationDecisionIdentifier(evaluationDecisionItem),
      );
      const evaluationDecisionsToAdd = evaluationDecisions.filter(evaluationDecisionItem => {
        const evaluationDecisionIdentifier = this.getEvaluationDecisionIdentifier(evaluationDecisionItem);
        if (evaluationDecisionCollectionIdentifiers.includes(evaluationDecisionIdentifier)) {
          return false;
        }
        evaluationDecisionCollectionIdentifiers.push(evaluationDecisionIdentifier);
        return true;
      });
      return [...evaluationDecisionsToAdd, ...evaluationDecisionCollection];
    }
    return evaluationDecisionCollection;
  }

  protected convertDateFromClient<T extends IEvaluationDecision | NewEvaluationDecision | PartialUpdateEvaluationDecision>(
    evaluationDecision: T,
  ): RestOf<T> {
    return {
      ...evaluationDecision,
      date: evaluationDecision.date?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restEvaluationDecision: RestEvaluationDecision): IEvaluationDecision {
    return {
      ...restEvaluationDecision,
      date: restEvaluationDecision.date ? dayjs(restEvaluationDecision.date) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestEvaluationDecision>): HttpResponse<IEvaluationDecision> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestEvaluationDecision[]>): HttpResponse<IEvaluationDecision[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
