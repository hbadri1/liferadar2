import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITripPlanStep, ITripPlanSubStep, NewTripPlanStep } from '../trip-plan-step.model';

export type PartialUpdateTripPlanStep = Partial<ITripPlanStep> & Pick<ITripPlanStep, 'id'>;

type RestSubStep = Omit<ITripPlanSubStep, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

type RestOf<T extends ITripPlanStep | NewTripPlanStep> = Omit<T, 'startDate' | 'endDate' | 'subSteps'> & {
  startDate?: string | null;
  endDate?: string | null;
  subSteps?: RestSubStep[] | null;
};

export type RestTripPlanStep = RestOf<ITripPlanStep>;

export type NewRestTripPlanStep = RestOf<NewTripPlanStep>;

export type PartialUpdateRestTripPlanStep = RestOf<PartialUpdateTripPlanStep>;

export type EntityResponseType = HttpResponse<ITripPlanStep>;
export type EntityArrayResponseType = HttpResponse<ITripPlanStep[]>;

@Injectable({ providedIn: 'root' })
export class TripPlanStepService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/trip-plan-steps');

  create(tripPlanStep: NewTripPlanStep): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlanStep);
    return this.http
      .post<RestTripPlanStep>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(tripPlanStep: ITripPlanStep): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlanStep);
    return this.http
      .put<RestTripPlanStep>(`${this.resourceUrl}/${this.getTripPlanStepIdentifier(tripPlanStep)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(tripPlanStep: PartialUpdateTripPlanStep): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlanStep);
    return this.http
      .patch<RestTripPlanStep>(`${this.resourceUrl}/${this.getTripPlanStepIdentifier(tripPlanStep)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTripPlanStep>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTripPlanStep[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTripPlanStepIdentifier(tripPlanStep: Pick<ITripPlanStep, 'id'>): number {
    return tripPlanStep.id;
  }

  compareTripPlanStep(o1: Pick<ITripPlanStep, 'id'> | null, o2: Pick<ITripPlanStep, 'id'> | null): boolean {
    return o1 && o2 ? this.getTripPlanStepIdentifier(o1) === this.getTripPlanStepIdentifier(o2) : o1 === o2;
  }

  addTripPlanStepToCollectionIfMissing<Type extends Pick<ITripPlanStep, 'id'>>(
    tripPlanStepCollection: Type[],
    ...tripPlanStepsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tripPlanSteps: Type[] = tripPlanStepsToCheck.filter(isPresent);
    if (tripPlanSteps.length > 0) {
      const tripPlanStepCollectionIdentifiers = tripPlanStepCollection.map(tripPlanStepItem =>
        this.getTripPlanStepIdentifier(tripPlanStepItem),
      );
      const tripPlanStepsToAdd = tripPlanSteps.filter(tripPlanStepItem => {
        const tripPlanStepIdentifier = this.getTripPlanStepIdentifier(tripPlanStepItem);
        if (tripPlanStepCollectionIdentifiers.includes(tripPlanStepIdentifier)) {
          return false;
        }
        tripPlanStepCollectionIdentifiers.push(tripPlanStepIdentifier);
        return true;
      });
      return [...tripPlanStepsToAdd, ...tripPlanStepCollection];
    }
    return tripPlanStepCollection;
  }

  protected convertDateFromClient<T extends ITripPlanStep | NewTripPlanStep | PartialUpdateTripPlanStep>(tripPlanStep: T): RestOf<T> {
    return {
      ...tripPlanStep,
      startDate: this.normalizeDateToString(tripPlanStep.startDate),
      endDate: this.normalizeDateToString(tripPlanStep.endDate),
      subSteps: tripPlanStep.subSteps?.map(subStep => ({
        ...subStep,
        startDate: this.normalizeDateToString(subStep.startDate),
        endDate: this.normalizeDateToString(subStep.endDate),
      })) ?? null,
    };
  }

  private normalizeDateToString(date: any): string | null {
    if (!date) return null;
    // If it's already a dayjs object, format it
    if (typeof date.format === 'function') {
      return date.format(DATE_TIME_FORMAT);
    }
    // If it's a string, return as-is (already formatted)
    if (typeof date === 'string') {
      return date;
    }
    // If it's a Date object, convert to dayjs first
    if (date instanceof Date) {
      return dayjs(date).format(DATE_TIME_FORMAT);
    }
    // Otherwise try to parse it as dayjs
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : null;
  }

  protected convertDateFromServer(restTripPlanStep: RestTripPlanStep): ITripPlanStep {
    return {
      ...restTripPlanStep,
      startDate: restTripPlanStep.startDate ? dayjs(restTripPlanStep.startDate) : undefined,
      endDate: restTripPlanStep.endDate ? dayjs(restTripPlanStep.endDate) : undefined,
      subSteps: restTripPlanStep.subSteps?.map(subStep => ({
        ...subStep,
        startDate: subStep.startDate ? dayjs(subStep.startDate) : undefined,
        endDate: subStep.endDate ? dayjs(subStep.endDate) : undefined,
      })) ?? null,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTripPlanStep>): HttpResponse<ITripPlanStep> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTripPlanStep[]>): HttpResponse<ITripPlanStep[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
