import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ISaaSSubscription, NewSaaSSubscription, SubscriptionMetrics } from '../saas-subscription.model';

export type PartialUpdateSaaSSubscription = Partial<ISaaSSubscription> & Pick<ISaaSSubscription, 'id'>;

export interface ITodoAppPushRequest {
  subscriptionId: number;
  provider: string;
  projectId?: string;
  title?: string;
  dueAt?: string;
}

export interface ITodoAppPushResponse {
  provider: string;
  externalTaskId: string;
  message: string;
}

export interface ITickTickProject {
  id: string;
  name: string;
}

export interface ITickTickProjectsResponse {
  defaultProjectName?: string | null;
  projects: ITickTickProject[];
}

export interface IMonthlyPaidExpenses {
  totalPaidSar: number;
  timezone: string;
  monthStart: string;
  monthEnd: string;
}

type RestOf<T extends ISaaSSubscription | NewSaaSSubscription | PartialUpdateSaaSSubscription> = Omit<
  T,
  'billDate' | 'dueDate' | 'paidDate' | 'subscriptionDate' | 'renewalDate' | 'createdDate' | 'lastModifiedDate'
> & {
  billDate?: string | null;
  dueDate?: string | null;
  paidDate?: string | null;
  subscriptionDate?: string | null;
  renewalDate?: string | null;
  createdDate?: string | null;
  lastModifiedDate?: string | null;
};

export type RestSaaSSubscription = RestOf<ISaaSSubscription>;
export type NewRestSaaSSubscription = RestOf<NewSaaSSubscription>;
export type PartialUpdateRestSaaSSubscription = RestOf<PartialUpdateSaaSSubscription>;

export type EntityResponseType = HttpResponse<ISaaSSubscription>;
export type EntityArrayResponseType = HttpResponse<ISaaSSubscription[]>;

@Injectable({ providedIn: 'root' })
export class SaaSSubscriptionService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/expenses');
  protected todoAppsUrl = this.applicationConfigService.getEndpointFor('api/todoapps');

  create(saasSubscription: NewSaaSSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(saasSubscription);
    return this.http
      .post<RestSaaSSubscription>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(saasSubscription: ISaaSSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(saasSubscription);
    return this.http
      .put<RestSaaSSubscription>(`${this.resourceUrl}/${this.getSaaSSubscriptionIdentifier(saasSubscription)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(saasSubscription: PartialUpdateSaaSSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(saasSubscription);
    return this.http
      .patch<RestSaaSSubscription>(`${this.resourceUrl}/${this.getSaaSSubscriptionIdentifier(saasSubscription)}`, copy, {
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestSaaSSubscription>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSaaSSubscription[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  queryMy(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestSaaSSubscription[]>(`${this.resourceUrl}/my`, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getMetrics(): Observable<HttpResponse<SubscriptionMetrics>> {
    return this.http.get<SubscriptionMetrics>(`${this.resourceUrl}/metrics/dashboard`, { observe: 'response' });
  }

  getCurrentMonthPaidExpenses(): Observable<HttpResponse<IMonthlyPaidExpenses>> {
    return this.http.get<IMonthlyPaidExpenses>(`${this.resourceUrl}/metrics/monthly-paid-current`, { observe: 'response' });
  }

  getUpcomingRenewals(days = 30): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestSaaSSubscription[]>(`${this.resourceUrl}/upcoming/renewals`, {
        params: { days },
        observe: 'response',
      })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  pushToTodoApp(request: ITodoAppPushRequest): Observable<HttpResponse<ITodoAppPushResponse>> {
    return this.http.post<ITodoAppPushResponse>(`${this.todoAppsUrl}/push`, request, { observe: 'response' });
  }

  getTickTickProjects(): Observable<HttpResponse<ITickTickProjectsResponse>> {
    return this.http.get<ITickTickProjectsResponse>(`${this.todoAppsUrl}/ticktick/projects`, { observe: 'response' });
  }

  getSaaSSubscriptionIdentifier(saasSubscription: Pick<ISaaSSubscription, 'id'>): number {
    return saasSubscription.id!;
  }

  compareSaaSSubscription(o1: Pick<ISaaSSubscription, 'id'> | null, o2: Pick<ISaaSSubscription, 'id'> | null): boolean {
    return o1 && o2 ? this.getSaaSSubscriptionIdentifier(o1) === this.getSaaSSubscriptionIdentifier(o2) : o1 === o2;
  }

  addSaaSSubscriptionToCollectionIfMissing<Type extends Pick<ISaaSSubscription, 'id'>>(
    saasSubscriptionCollection: Type[],
    ...saasSubscriptionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const saasSubscriptions: Type[] = saasSubscriptionsToCheck.filter(isPresent);
    if (saasSubscriptions.length > 0) {
      const saasSubscriptionCollectionIdentifiers = saasSubscriptionCollection.map(saasSubscriptionItem =>
        this.getSaaSSubscriptionIdentifier(saasSubscriptionItem),
      );
      const saasSubscriptionsToAdd = saasSubscriptions.filter(saasSubscriptionItem => {
        const saasSubscriptionIdentifier = this.getSaaSSubscriptionIdentifier(saasSubscriptionItem);
        if (saasSubscriptionCollectionIdentifiers.includes(saasSubscriptionIdentifier)) {
          return false;
        }
        saasSubscriptionCollectionIdentifiers.push(saasSubscriptionIdentifier);
        return true;
      });
      return [...saasSubscriptionsToAdd, ...saasSubscriptionCollection];
    }
    return saasSubscriptionCollection;
  }

  protected convertDateFromClient<T extends ISaaSSubscription | NewSaaSSubscription | PartialUpdateSaaSSubscription>(
    saasSubscription: T,
  ): RestOf<T> {
    const billingItem = saasSubscription as Partial<ISaaSSubscription>;
    return {
      ...saasSubscription,
      billDate: this.normalizeDateToString(billingItem.billDate, DATE_FORMAT),
      dueDate: this.normalizeDateToString(billingItem.dueDate, DATE_FORMAT),
      paidDate: this.normalizeDateToString(billingItem.paidDate, DATE_FORMAT),
      subscriptionDate: this.normalizeDateToString(billingItem.subscriptionDate, DATE_FORMAT),
      renewalDate: this.normalizeDateToString(billingItem.renewalDate, DATE_FORMAT),
      createdDate: this.normalizeDateTimeToString(billingItem.createdDate),
      lastModifiedDate: this.normalizeDateTimeToString(billingItem.lastModifiedDate),
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
    // If it's a dayjs object, call toISOString
    if (typeof date.toISOString === 'function') {
      return date.toISOString();
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
    return parsed.isValid() ? parsed.toISOString() : null;
  }

  protected convertDateFromServer(restSaaSSubscription: RestSaaSSubscription): ISaaSSubscription {
    return {
      ...restSaaSSubscription,
      billDate: (restSaaSSubscription as RestSaaSSubscription & { billDate?: string | null }).billDate
        ? dayjs((restSaaSSubscription as RestSaaSSubscription & { billDate?: string | null }).billDate)
        : undefined,
      dueDate: (restSaaSSubscription as RestSaaSSubscription & { dueDate?: string | null }).dueDate
        ? dayjs((restSaaSSubscription as RestSaaSSubscription & { dueDate?: string | null }).dueDate)
        : undefined,
      paidDate: (restSaaSSubscription as RestSaaSSubscription & { paidDate?: string | null }).paidDate
        ? dayjs((restSaaSSubscription as RestSaaSSubscription & { paidDate?: string | null }).paidDate)
        : undefined,
      subscriptionDate: dayjs(restSaaSSubscription.subscriptionDate),
      renewalDate: restSaaSSubscription.renewalDate ? dayjs(restSaaSSubscription.renewalDate) : undefined,
      createdDate: restSaaSSubscription.createdDate ? dayjs(restSaaSSubscription.createdDate) : undefined,
      lastModifiedDate: restSaaSSubscription.lastModifiedDate ? dayjs(restSaaSSubscription.lastModifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestSaaSSubscription>): HttpResponse<ISaaSSubscription> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestSaaSSubscription[]>): HttpResponse<ISaaSSubscription[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
