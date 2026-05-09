import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITripPlan, NewTripPlan } from '../trip-plan.model';

export type PartialUpdateTripPlan = Partial<ITripPlan> & Pick<ITripPlan, 'id'>;

type RestOf<T extends ITripPlan | NewTripPlan> = Omit<T, 'startDate' | 'endDate'> & {
  startDate?: string | null;
  endDate?: string | null;
};

export type RestTripPlan = RestOf<ITripPlan>;

export type NewRestTripPlan = RestOf<NewTripPlan>;

export type PartialUpdateRestTripPlan = RestOf<PartialUpdateTripPlan>;

export type EntityResponseType = HttpResponse<ITripPlan>;
export type EntityArrayResponseType = HttpResponse<ITripPlan[]>;

@Injectable({ providedIn: 'root' })
export class TripPlanService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/trip-plans');

  create(tripPlan: NewTripPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlan);
    return this.http
      .post<RestTripPlan>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(tripPlan: ITripPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlan);
    return this.http
      .put<RestTripPlan>(`${this.resourceUrl}/${this.getTripPlanIdentifier(tripPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(tripPlan: PartialUpdateTripPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tripPlan);
    return this.http
      .patch<RestTripPlan>(`${this.resourceUrl}/${this.getTripPlanIdentifier(tripPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTripPlan>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTripPlan[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTripPlanIdentifier(tripPlan: Pick<ITripPlan, 'id'>): number {
    return tripPlan.id;
  }

  compareTripPlan(o1: Pick<ITripPlan, 'id'> | null, o2: Pick<ITripPlan, 'id'> | null): boolean {
    return o1 && o2 ? this.getTripPlanIdentifier(o1) === this.getTripPlanIdentifier(o2) : o1 === o2;
  }

  addTripPlanToCollectionIfMissing<Type extends Pick<ITripPlan, 'id'>>(
    tripPlanCollection: Type[],
    ...tripPlansToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tripPlans: Type[] = tripPlansToCheck.filter(isPresent);
    if (tripPlans.length > 0) {
      const tripPlanCollectionIdentifiers = tripPlanCollection.map(tripPlanItem => this.getTripPlanIdentifier(tripPlanItem));
      const tripPlansToAdd = tripPlans.filter(tripPlanItem => {
        const tripPlanIdentifier = this.getTripPlanIdentifier(tripPlanItem);
        if (tripPlanCollectionIdentifiers.includes(tripPlanIdentifier)) {
          return false;
        }
        tripPlanCollectionIdentifiers.push(tripPlanIdentifier);
        return true;
      });
      return [...tripPlansToAdd, ...tripPlanCollection];
    }
    return tripPlanCollection;
  }

  protected convertDateFromClient<T extends ITripPlan | NewTripPlan | PartialUpdateTripPlan>(tripPlan: T): RestOf<T> {
    return {
      ...tripPlan,
      startDate: this.normalizeDateToString(tripPlan.startDate),
      endDate: this.normalizeDateToString(tripPlan.endDate),
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

  protected convertDateFromServer(restTripPlan: RestTripPlan): ITripPlan {
    return {
      ...restTripPlan,
      startDate: restTripPlan.startDate ? dayjs(restTripPlan.startDate) : undefined,
      endDate: restTripPlan.endDate ? dayjs(restTripPlan.endDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTripPlan>): HttpResponse<ITripPlan> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTripPlan[]>): HttpResponse<ITripPlan[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
