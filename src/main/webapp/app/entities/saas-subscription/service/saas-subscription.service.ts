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

type RestOf<T extends ISaaSSubscription | NewSaaSSubscription | PartialUpdateSaaSSubscription> = Omit<
  T,
  'subscriptionDate' | 'renewalDate' | 'createdDate' | 'lastModifiedDate'
> & {
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

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/saas-subscriptions');
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
      .put<RestSaaSSubscription>(
        `${this.resourceUrl}/${this.getSaaSSubscriptionIdentifier(saasSubscription)}`,
        copy,
        { observe: 'response' }
      )
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(saasSubscription: PartialUpdateSaaSSubscription): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(saasSubscription);
    return this.http
      .patch<RestSaaSSubscription>(
        `${this.resourceUrl}/${this.getSaaSSubscriptionIdentifier(saasSubscription)}`,
        copy,
        { observe: 'response' }
      )
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

  getUpcomingRenewals(days: number = 30): Observable<EntityArrayResponseType> {
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

  compareSaaSSubscription(
    o1: Pick<ISaaSSubscription, 'id'> | null,
    o2: Pick<ISaaSSubscription, 'id'> | null
  ): boolean {
    return o1 && o2 ? this.getSaaSSubscriptionIdentifier(o1) === this.getSaaSSubscriptionIdentifier(o2) : o1 === o2;
  }

  addSaaSSubscriptionToCollectionIfMissing<Type extends Pick<ISaaSSubscription, 'id'>>(
    saasSubscriptionCollection: Type[],
    ...saasSubscriptionsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const saasSubscriptions: Type[] = saasSubscriptionsToCheck.filter(isPresent);
    if (saasSubscriptions.length > 0) {
      const saasSubscriptionCollectionIdentifiers = saasSubscriptionCollection.map(saasSubscriptionItem =>
        this.getSaaSSubscriptionIdentifier(saasSubscriptionItem)
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
    saasSubscription: T
  ): RestOf<T> {
    return {
      ...saasSubscription,
      subscriptionDate: saasSubscription.subscriptionDate?.format(DATE_FORMAT) ?? null,
      renewalDate: saasSubscription.renewalDate?.format(DATE_FORMAT) ?? null,
      createdDate: saasSubscription.createdDate?.toISOString() ?? null,
      lastModifiedDate: saasSubscription.lastModifiedDate?.toISOString() ?? null,
    };
  }

  protected convertDateFromServer(restSaaSSubscription: RestSaaSSubscription): ISaaSSubscription {
    return {
      ...restSaaSSubscription,
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

